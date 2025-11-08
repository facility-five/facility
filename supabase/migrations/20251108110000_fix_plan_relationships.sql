-- Corrigir problemas nas relações entre plans e payments

-- 1. Verificar e corrigir a coluna plan na tabela payments
DO $$
BEGIN
    -- Renomear a coluna para plan_id se necessário
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'plan'
    ) THEN
        ALTER TABLE public.payments 
        RENAME COLUMN plan TO plan_id;
    END IF;
    
    -- Garantir que a coluna plan_id é do tipo UUID
    ALTER TABLE public.payments 
    ALTER COLUMN plan_id TYPE uuid USING plan_id::uuid;
END $$;

-- 2. Adicionar foreign key constraint
ALTER TABLE public.payments
DROP CONSTRAINT IF EXISTS payments_plan_id_fkey;

ALTER TABLE public.payments
ADD CONSTRAINT payments_plan_id_fkey 
FOREIGN KEY (plan_id) 
REFERENCES public.plans(id)
ON DELETE RESTRICT;

-- 3. Adicionar índice para melhorar performance
CREATE INDEX IF NOT EXISTS payments_plan_id_idx 
ON public.payments(plan_id);

-- 4. Atualizar RLS policies para usar plan_id
DROP POLICY IF EXISTS "Usuários podem ver seus próprios pagamentos" ON public.payments;
CREATE POLICY "Usuários podem ver seus próprios pagamentos" ON public.payments
    FOR SELECT
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.administrators 
            WHERE user_id = auth.uid() AND 
            administrators.id = payments.administrator_id
        )
    );