-- VERIFICAÇÃO E CORREÇÃO DA TABELA COMMUNICATIONS
-- Migration para garantir estrutura correta da tabela communications

-- 1. Se a tabela não existir, criar com estrutura correta
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'communications'
    ) THEN
        -- Criar tabela communications
        CREATE TABLE public.communications (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            code TEXT,
            title TEXT NOT NULL,
            content TEXT,
            condo_id UUID NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
            created_by UUID REFERENCES auth.users(id),
            expiration_date DATE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Índices
        CREATE INDEX idx_communications_condo_id ON public.communications(condo_id);
        CREATE INDEX idx_communications_created_by ON public.communications(created_by);
        
        RAISE NOTICE 'Tabela communications criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela communications já existe';
    END IF;
END $$;

-- 2. Verificar se a coluna condo_id existe (pode ser condominium_id)
DO $$
BEGIN
    -- Se existe condominium_id mas não condo_id, renomear
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'communications' 
        AND column_name = 'condominium_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'communications' 
        AND column_name = 'condo_id'
    ) THEN
        ALTER TABLE public.communications 
        RENAME COLUMN condominium_id TO condo_id;
        
        RAISE NOTICE 'Coluna condominium_id renomeada para condo_id';
    END IF;
    
    -- Se não existe condo_id nem condominium_id, adicionar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'communications' 
        AND column_name = 'condo_id'
    ) THEN
        ALTER TABLE public.communications 
        ADD COLUMN condo_id UUID NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Coluna condo_id adicionada';
    END IF;
END $$;

-- 3. Garantir que RLS está habilitado
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

-- 4. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view communications from their condominiums" ON public.communications;
DROP POLICY IF EXISTS "Users can insert communications in their condominiums" ON public.communications;
DROP POLICY IF EXISTS "Users can update communications from their condominiums" ON public.communications;
DROP POLICY IF EXISTS "Users can delete communications from their condominiums" ON public.communications;

-- 5. Criar políticas RLS atualizadas
CREATE POLICY "Users can view communications from their condominiums"
    ON public.communications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.condominiums c
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE c.id = communications.condo_id
            AND (a.user_id = auth.uid() OR a.responsible_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert communications in their condominiums"
    ON public.communications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.condominiums c
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE c.id = communications.condo_id
            AND (a.user_id = auth.uid() OR a.responsible_id = auth.uid())
        )
    );

CREATE POLICY "Users can update communications from their condominiums"
    ON public.communications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.condominiums c
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE c.id = communications.condo_id
            AND (a.user_id = auth.uid() OR a.responsible_id = auth.uid())
        )
    );

CREATE POLICY "Users can delete communications from their condominiums"
    ON public.communications FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.condominiums c
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE c.id = communications.condo_id
            AND (a.user_id = auth.uid() OR a.responsible_id = auth.uid())
        )
    );