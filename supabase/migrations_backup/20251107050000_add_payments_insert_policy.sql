-- Adicionar política RLS de INSERT para tabela payments
-- Necessário para permitir que usuários ativem planos gratuitos diretamente

-- Permitir que usuários autenticados insiram seus próprios pagamentos
DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;
CREATE POLICY "payments_insert_own" ON public.payments
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Permitir que usuários autenticados atualizem seus próprios pagamentos
DROP POLICY IF EXISTS "payments_update_own" ON public.payments;
CREATE POLICY "payments_update_own" ON public.payments
    FOR UPDATE 
    USING (auth.uid() = user_id);
