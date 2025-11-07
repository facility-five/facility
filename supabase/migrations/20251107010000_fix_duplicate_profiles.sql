-- Corrigir profiles duplicados
-- Manter apenas o profile mais recente para cada usuário

-- Primeiro, vamos identificar e deletar profiles duplicados, mantendo apenas o mais recente
WITH duplicates AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (PARTITION BY id ORDER BY created_at DESC, updated_at DESC NULLS LAST) as rn
    FROM public.profiles
)
DELETE FROM public.profiles
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- Adicionar constraint UNIQUE para prevenir duplicatas no futuro
-- (a PRIMARY KEY já garante isso, mas vamos garantir explicitamente)
DO $$ 
BEGIN
    -- Verificar se a constraint já existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_id_unique'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_id_unique UNIQUE (id);
    END IF;
END $$;

-- Adicionar índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
