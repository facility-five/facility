-- Alterar role padrão de 'Morador' para 'Administradora'
-- Moradores não criam conta própria, apenas administradoras

-- Modificar a função de criação de usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    free_plan_id UUID;
BEGIN
    -- Inserir profile com role padrão 'Administradora'
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
        COALESCE(NEW.raw_user_meta_data->>'role', 'Administradora'), -- Mudado de 'Morador' para 'Administradora'
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

-- Atualizar usuários existentes com role 'Morador' para 'Administradora'
-- (apenas se não forem realmente moradores criados por administradoras)
UPDATE public.profiles
SET role = 'Administradora'
WHERE role = 'Morador'
  AND id IN (
    SELECT user_id FROM public.payments WHERE status = 'active'
  );
