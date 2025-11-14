-- Garantir que a coluna user_id existe na tabela administrators
DO $$ 
BEGIN
  -- Adiciona a coluna user_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'administrators' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.administrators 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    
    -- Cria índice para performance
    CREATE INDEX IF NOT EXISTS idx_administrators_user_id ON public.administrators(user_id);
  END IF;
END $$;

-- Atualizar registros existentes que não têm user_id
-- Usa o responsible_id como fallback para user_id
UPDATE public.administrators
SET user_id = responsible_id
WHERE user_id IS NULL AND responsible_id IS NOT NULL;

-- Comentário explicativo
COMMENT ON COLUMN public.administrators.user_id IS 'ID do usuário que criou/cadastrou a administradora';
