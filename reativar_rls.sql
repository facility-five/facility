-- REABILITAR RLS APÓS TESTE
-- Execute após confirmar se funcionou sem RLS

-- 1. Reabilitar RLS
ALTER TABLE public.resident_requests ENABLE ROW LEVEL SECURITY;

-- 2. Criar política simples e funcional
DROP POLICY IF EXISTS "Administrators can manage requests from their condominiums" ON public.resident_requests;

CREATE POLICY "Administrators can manage requests from their condominiums" 
ON public.resident_requests
FOR ALL
TO authenticated
USING (
  condominium_id IN (
    SELECT condominium_id 
    FROM public.administrators 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  condominium_id IN (
    SELECT condominium_id 
    FROM public.administrators 
    WHERE user_id = auth.uid()
  )
);

-- 3. Verificar política
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'resident_requests';

RAISE NOTICE 'RLS reabilitado com política simples!';