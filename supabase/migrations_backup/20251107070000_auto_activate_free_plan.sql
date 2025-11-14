-- Ativar plano gratuito automaticamente ao criar usuário
-- Nova abordagem: criar pagamento gratuito no trigger de criação de usuário

-- 1. Primeiro, garantir que existe um plano gratuito
INSERT INTO public.plans (name, description, price, period, status, features, stripe_price_id)
VALUES (
    'Plan Gratuito',
    'Plano gratuito com recursos limitados',
    0,
    'monthly',
    'active',
    ARRAY['Até 6 condomínios', 'Até 10 unidades', 'Recursos básicos'],
    NULL
)
ON CONFLICT DO NOTHING;

-- 2. Modificar a função de criação de usuário para incluir plano gratuito
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    free_plan_id UUID;
BEGIN
    -- Inserir profile
    INSERT INTO public.profiles (
        id,
        first_name,
        last_name,
        email,
        whatsapp,
        role,
        status,
        subscription_status,
        last_sign_in_at
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'Morador'),
        COALESCE(NEW.raw_user_meta_data->>'status', 'Ativo'),
        'active', -- Já ativa com plano gratuito
        NEW.last_sign_in_at
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        last_sign_in_at = EXCLUDED.last_sign_in_at,
        subscription_status = 'active';
    
    -- Buscar ID do plano gratuito
    SELECT id INTO free_plan_id
    FROM public.plans
    WHERE price = 0 AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Se encontrou plano gratuito, criar pagamento automaticamente
    IF free_plan_id IS NOT NULL THEN
        INSERT INTO public.payments (
            user_id,
            plan,
            amount,
            status
        )
        VALUES (
            NEW.id,
            free_plan_id,
            0,
            'active'
        )
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Plano gratuito ativado automaticamente para usuário %', NEW.id;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro mas não falhar
        RAISE WARNING 'Erro ao criar profile/plano para usuário %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Garantir que o trigger está ativo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4. Ativar plano gratuito para usuários existentes que não têm plano
DO $$
DECLARE
    free_plan_id UUID;
BEGIN
    -- Buscar ID do plano gratuito
    SELECT id INTO free_plan_id
    FROM public.plans
    WHERE price = 0 AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF free_plan_id IS NOT NULL THEN
        -- Criar pagamentos para usuários sem plano ativo
        INSERT INTO public.payments (user_id, plan, amount, status)
        SELECT 
            p.id,
            free_plan_id,
            0,
            'active'
        FROM public.profiles p
        LEFT JOIN public.payments pay ON pay.user_id = p.id AND pay.status = 'active'
        WHERE pay.id IS NULL
        ON CONFLICT DO NOTHING;
        
        -- Atualizar subscription_status
        UPDATE public.profiles
        SET subscription_status = 'active'
        WHERE id IN (
            SELECT user_id FROM public.payments WHERE status = 'active'
        );
        
        RAISE NOTICE 'Planos gratuitos ativados para usuários existentes';
    END IF;
END $$;
