-- Garantir que todos os usuários tenham plano gratuito associado corretamente
-- Corrige casos onde payment foi criado mas sem plan_id ou não foi criado

-- 1. Buscar ou criar plano gratuito se não existir
DO $$
DECLARE
    free_plan_id UUID;
BEGIN
    -- Verificar se existe plano gratuito
    SELECT id INTO free_plan_id
    FROM public.plans
    WHERE price = 0 AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Se não existir, criar
    IF free_plan_id IS NULL THEN
        INSERT INTO public.plans (name, description, price, period, status, features, stripe_price_id)
        VALUES (
            'Plan Gratuito',
            'Plano gratuito com acesso completo',
            0,
            'monthly',
            'active',
            ARRAY['Acesso completo', 'Sem limitações', 'Suporte básico'],
            NULL
        )
        RETURNING id INTO free_plan_id;
        
        RAISE NOTICE 'Plano gratuito criado com ID: %', free_plan_id;
    ELSE
        RAISE NOTICE 'Plano gratuito encontrado com ID: %', free_plan_id;
    END IF;
    
    -- 2. Atualizar payments existentes sem plan associado
    UPDATE public.payments
    SET plan = free_plan_id
    WHERE plan IS NULL 
      AND amount = 0
      AND status = 'active';
    
    RAISE NOTICE 'Payments atualizados com plano gratuito';
    
    -- 3. Criar payments para usuários que não têm nenhum payment
    INSERT INTO public.payments (user_id, plan, amount, status)
    SELECT 
        p.id,
        free_plan_id,
        0,
        'active'
    FROM public.profiles p
    LEFT JOIN public.payments pay ON pay.user_id = p.id
    WHERE pay.id IS NULL
      AND p.subscription_status = 'active'
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Payments criados para usuários sem payment';
    
    -- 4. Garantir que todos os profiles com payment ativo têm subscription_status = active
    UPDATE public.profiles
    SET subscription_status = 'active'
    WHERE id IN (
        SELECT user_id FROM public.payments WHERE status = 'active'
    )
    AND subscription_status != 'active';
    
    RAISE NOTICE 'Profiles atualizados com subscription_status = active';
    
END $$;

-- 5. Criar índices para melhorar performance das queries do usePlan
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON public.payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_plan ON public.payments(plan);
CREATE INDEX IF NOT EXISTS idx_plans_price_status ON public.plans(price, status);

-- 6. Verificar resultado final
DO $$
DECLARE
    total_users INT;
    users_with_payment INT;
    users_with_active_payment INT;
BEGIN
    SELECT COUNT(*) INTO total_users FROM public.profiles;
    SELECT COUNT(DISTINCT user_id) INTO users_with_payment FROM public.payments;
    SELECT COUNT(DISTINCT user_id) INTO users_with_active_payment FROM public.payments WHERE status = 'active';
    
    RAISE NOTICE '=== RESULTADO FINAL ===';
    RAISE NOTICE 'Total de usuários: %', total_users;
    RAISE NOTICE 'Usuários com payment: %', users_with_payment;
    RAISE NOTICE 'Usuários com payment ativo: %', users_with_active_payment;
END $$;
