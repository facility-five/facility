-- Garantir que o plano gratuito funcione corretamente
-- Esta migration corrige problemas de ativação do plano gratuito

-- 1. Garantir que existe um plano gratuito ativo
DO $$
DECLARE
    free_plan_id UUID;
    free_plan_count INT;
BEGIN
    -- Verificar quantos planos gratuitos existem
    SELECT COUNT(*) INTO free_plan_count
    FROM public.plans
    WHERE price = 0 AND status = 'active';
    
    RAISE NOTICE 'Planos gratuitos ativos encontrados: %', free_plan_count;
    
    -- Se não existe nenhum, criar
    IF free_plan_count = 0 THEN
        INSERT INTO public.plans (
            name, 
            description, 
            price, 
            period, 
            status, 
            features, 
            stripe_price_id,
            max_condos,
            max_units
        )
        VALUES (
            'Plan Gratuito',
            'Plano gratuito com recursos completos para começar',
            0,
            'monthly',
            'active',
            ARRAY[
                'Acesso completo a todas funcionalidades',
                'Gestão de condomínios',
                'Gestão de unidades',
                'Gestão de moradores',
                'Comunicados',
                'Reservas de áreas comuns'
            ],
            NULL,
            999999, -- Sem limite de condomínios
            999999  -- Sem limite de unidades
        )
        RETURNING id INTO free_plan_id;
        
        RAISE NOTICE 'Plano gratuito criado com ID: %', free_plan_id;
    ELSE
        -- Pegar o ID do plano gratuito existente
        SELECT id INTO free_plan_id
        FROM public.plans
        WHERE price = 0 AND status = 'active'
        ORDER BY created_at DESC
        LIMIT 1;
        
        RAISE NOTICE 'Plano gratuito existente com ID: %', free_plan_id;
        
        -- Atualizar para garantir limites generosos
        UPDATE public.plans
        SET 
            max_condos = COALESCE(max_condos, 999999),
            max_units = COALESCE(max_units, 999999),
            status = 'active'
        WHERE id = free_plan_id;
    END IF;
    
    -- 2. Ativar plano gratuito para TODOS os usuários que não têm payment ativo
    INSERT INTO public.payments (user_id, plan, amount, status, plan_id)
    SELECT 
        p.id,
        'free',
        0,
        'active',
        free_plan_id
    FROM public.profiles p
    WHERE NOT EXISTS (
        SELECT 1 FROM public.payments pay 
        WHERE pay.user_id = p.id 
        AND pay.status = 'active'
    )
    ON CONFLICT DO NOTHING;
    
    -- 3. Atualizar subscription_status de todos os usuários com payment ativo
    UPDATE public.profiles
    SET subscription_status = 'active'
    WHERE id IN (
        SELECT DISTINCT user_id 
        FROM public.payments 
        WHERE status = 'active'
    )
    AND (subscription_status IS NULL OR subscription_status != 'active');
    
    -- 4. Corrigir payments que estão ativos mas sem plan_id associado
    UPDATE public.payments
    SET plan_id = free_plan_id
    WHERE status = 'active'
      AND (plan_id IS NULL OR plan_id NOT IN (SELECT id FROM public.plans))
      AND amount = 0;
    
    RAISE NOTICE 'Plano gratuito ativado para todos os usuários sem plano ativo';
END $$;

-- 5. Criar função RPC para ativar plano gratuito manualmente (útil para debug)
CREATE OR REPLACE FUNCTION public.activate_free_plan_for_user(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
    free_plan_id UUID;
    payment_id UUID;
    result JSON;
BEGIN
    -- Buscar plano gratuito
    SELECT id INTO free_plan_id
    FROM public.plans
    WHERE price = 0 AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF free_plan_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Plano gratuito não encontrado'
        );
    END IF;
    
    -- Verificar se já tem payment ativo
    SELECT id INTO payment_id
    FROM public.payments
    WHERE user_id = target_user_id
      AND status = 'active'
    LIMIT 1;
    
    IF payment_id IS NOT NULL THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Usuário já possui plano ativo',
            'payment_id', payment_id
        );
    END IF;
    
    -- Criar payment gratuito
    INSERT INTO public.payments (user_id, plan, amount, status, plan_id)
    VALUES (target_user_id, 'free', 0, 'active', free_plan_id)
    RETURNING id INTO payment_id;
    
    -- Atualizar subscription_status
    UPDATE public.profiles
    SET subscription_status = 'active'
    WHERE id = target_user_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Plano gratuito ativado com sucesso',
        'payment_id', payment_id,
        'plan_id', free_plan_id
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'message', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Criar função RPC para verificar status do plano de um usuário
CREATE OR REPLACE FUNCTION public.check_user_plan_status(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'user_id', p.id,
        'email', p.email,
        'subscription_status', p.subscription_status,
        'has_active_payment', EXISTS(
            SELECT 1 FROM public.payments pay 
            WHERE pay.user_id = p.id AND pay.status = 'active'
        ),
        'active_payments', (
            SELECT json_agg(json_build_object(
                'payment_id', pay.id,
                'plan_id', pay.plan_id,
                'plan_name', pl.name,
                'amount', pay.amount,
                'status', pay.status,
                'created_at', pay.created_at
            ))
            FROM public.payments pay
            LEFT JOIN public.plans pl ON pl.id = pay.plan_id
            WHERE pay.user_id = p.id AND pay.status = 'active'
        )
    ) INTO result
    FROM public.profiles p
    WHERE p.id = target_user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Adicionar comentários para documentação
COMMENT ON FUNCTION public.activate_free_plan_for_user IS 'Ativa plano gratuito para um usuário específico';
COMMENT ON FUNCTION public.check_user_plan_status IS 'Verifica o status do plano de um usuário';
