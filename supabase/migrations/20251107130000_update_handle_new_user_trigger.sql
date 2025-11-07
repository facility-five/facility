-- Atualizar trigger para garantir plano gratuito no cadastro de Administradora
-- Corrige o uso de plan_id ao invés de plan

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
        COALESCE(NEW.raw_user_meta_data->>'role', 'Administradora'),
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
            status,
            plan_id
        )
        VALUES (
            NEW.id,
            'free',
            0,
            'active',
            free_plan_id
        )
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Plano gratuito ativado automaticamente para usuário % com role %', NEW.id, COALESCE(NEW.raw_user_meta_data->>'role', 'Administradora');
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro mas não falhar
        RAISE WARNING 'Erro ao criar profile/plano para usuário %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que o trigger está ativo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Comentário para documentação
COMMENT ON FUNCTION public.handle_new_user IS 'Trigger que cria profile e ativa plano gratuito automaticamente para novos usuários';
