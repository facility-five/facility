-- Adicionar coluna condominium_id à tabela blocks se não existir
-- Isso é necessário para a página de gestão de moradores funcionar

-- Verificar se a coluna já existe antes de adicionar
DO $$ 
BEGIN
    -- Adicionar coluna condominium_id se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'blocks' 
        AND column_name = 'condominium_id'
    ) THEN
        ALTER TABLE public.blocks 
        ADD COLUMN condominium_id UUID REFERENCES public.condominiums(id) ON DELETE CASCADE;
        
        -- Criar índice para melhor performance
        CREATE INDEX IF NOT EXISTS idx_blocks_condominium_id ON public.blocks(condominium_id);
        
        RAISE NOTICE 'Coluna condominium_id adicionada à tabela blocks';
    ELSE
        RAISE NOTICE 'Coluna condominium_id já existe na tabela blocks';
    END IF;
END $$;
