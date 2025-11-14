-- Correção final da tabela communications - apenas mudanças essenciais
-- Esta migration verifica e corrige APENAS as inconsistências de colunas

-- 1. Renomear condominium_id para condo_id se existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'communications' 
        AND column_name = 'condominium_id'
    ) THEN
        ALTER TABLE public.communications 
        RENAME COLUMN condominium_id TO condo_id;
        
        RAISE NOTICE 'Coluna condominium_id renomeada para condo_id com sucesso';
    ELSE
        RAISE NOTICE 'Coluna condominium_id não encontrada - estrutura já está correta';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Erro ao renomear coluna: %', SQLERRM;
END $$;