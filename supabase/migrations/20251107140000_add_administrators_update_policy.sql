-- Adiciona política RLS para permitir que usuários atualizem suas próprias administradoras
-- Verifica se RLS está habilitado na tabela administrators
DO $$ 
BEGIN
  -- Habilita RLS se ainda não estiver habilitado
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'administrators'
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.administrators ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Remove política de update se já existir
DROP POLICY IF EXISTS "Users can update their own administrators" ON public.administrators;

-- Cria política para permitir que usuários atualizem administradoras onde são proprietários ou responsáveis
CREATE POLICY "Users can update their own administrators"
ON public.administrators
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR auth.uid() = responsible_id
)
WITH CHECK (
  auth.uid() = user_id OR auth.uid() = responsible_id
);

-- Verifica se já existe política de SELECT, se não, cria
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'administrators' 
    AND policyname = 'Users can view their own administrators'
  ) THEN
    CREATE POLICY "Users can view their own administrators"
    ON public.administrators
    FOR SELECT
    TO authenticated
    USING (
      auth.uid() = user_id OR auth.uid() = responsible_id
    );
  END IF;
END $$;

-- Verifica se já existe política de INSERT, se não, cria
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'administrators' 
    AND policyname = 'Users can insert their own administrators'
  ) THEN
    CREATE POLICY "Users can insert their own administrators"
    ON public.administrators
    FOR INSERT
    TO authenticated
    WITH CHECK (
      auth.uid() = user_id
    );
  END IF;
END $$;
