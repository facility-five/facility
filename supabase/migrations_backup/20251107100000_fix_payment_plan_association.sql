-- Corrigir associação de planos em payments
-- O problema é que a query busca por 'plan_id' mas a coluna é 'plan'

-- 1. Verificar estrutura da tabela payments
DO $$
BEGIN
    RAISE NOTICE 'Verificando estrutura da tabela payments...';
END $$;

-- 2. Garantir que todos os payments têm o plano gratuito associado
DO $$
DECLARE
    free_plan_id UUID;
    updated_count INT;
BEGIN
    -- Buscar plano gratuito
    SELECT id INTO free_plan_id
    FROM public.plans
    WHERE price = 0 AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF free_plan_id IS NULL THEN
        RAISE EXCEPTION 'Plano gratuito não encontrado!';
    END IF;
    
    RAISE NOTICE 'Plano gratuito encontrado: %', free_plan_id;
    
    -- Atualizar payments que não têm plano associado
    UPDATE public.payments
    SET plan = free_plan_id
    WHERE (plan IS NULL OR plan::text = '')
      AND status = 'active'
      AND amount = 0;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Payments atualizados: %', updated_count;
    
    -- Verificar resultado
    RAISE NOTICE 'Verificando payments após atualização...';
    
END $$;

-- 3. Adicionar constraint para garantir que payments ativos têm plano
ALTER TABLE public.payments
DROP CONSTRAINT IF EXISTS payments_active_must_have_plan;

ALTER TABLE public.payments
ADD CONSTRAINT payments_active_must_have_plan
CHECK (
    status != 'active' OR plan IS NOT NULL
);

COMMENT ON CONSTRAINT payments_active_must_have_plan ON public.payments IS 
'Garante que payments com status active sempre têm um plano associado';
