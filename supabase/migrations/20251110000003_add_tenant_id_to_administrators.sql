-- Adicionar coluna tenant_id à tabela administrators se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'administrators' 
        AND column_name = 'tenant_id'
    ) THEN
        -- Adicionar a coluna
        ALTER TABLE public.administrators ADD COLUMN tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        
        -- Se existir user_id, copiar os valores para tenant_id
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'administrators' 
            AND column_name = 'user_id'
        ) THEN
            UPDATE public.administrators SET tenant_id = user_id WHERE tenant_id IS NULL;
        END IF;
        
        -- Criar índice para melhor performance
        CREATE INDEX IF NOT EXISTS idx_administrators_tenant_id ON public.administrators(tenant_id);
    END IF;
END $$;
