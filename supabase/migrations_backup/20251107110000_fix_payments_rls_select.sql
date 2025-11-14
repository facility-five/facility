-- Corrigir políticas RLS de SELECT em payments
-- O problema é que a query retorna array vazio mesmo com payments existentes

-- 1. Verificar políticas atuais
DO $$
BEGIN
    RAISE NOTICE 'Verificando políticas RLS em payments...';
END $$;

-- 2. Remover políticas antigas que podem estar bloqueando
DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;
DROP POLICY IF EXISTS "payments_update_own" ON public.payments;

-- 3. Criar política SELECT mais permissiva
CREATE POLICY "payments_select_own" ON public.payments
    FOR SELECT
    USING (
        auth.uid() = user_id
    );

COMMENT ON POLICY "payments_select_own" ON public.payments IS
'Permite que usuários vejam seus próprios pagamentos';

-- 4. Recriar política INSERT
CREATE POLICY "payments_insert_own" ON public.payments
    FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id
    );

COMMENT ON POLICY "payments_insert_own" ON public.payments IS
'Permite que usuários criem seus próprios pagamentos';

-- 5. Recriar política UPDATE
CREATE POLICY "payments_update_own" ON public.payments
    FOR UPDATE 
    USING (
        auth.uid() = user_id
    );

COMMENT ON POLICY "payments_update_own" ON public.payments IS
'Permite que usuários atualizem seus próprios pagamentos';

-- 6. Verificar se RLS está habilitado
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 7. Testar se as políticas funcionam
DO $$
DECLARE
    test_count INT;
BEGIN
    -- Contar payments (como service_role, bypass RLS)
    SELECT COUNT(*) INTO test_count FROM public.payments;
    RAISE NOTICE 'Total de payments na tabela: %', test_count;
    
    -- Mostrar alguns payments para debug
    RAISE NOTICE 'Primeiros payments:';
    PERFORM id, user_id, plan, status, amount
    FROM public.payments
    LIMIT 5;
END $$;
