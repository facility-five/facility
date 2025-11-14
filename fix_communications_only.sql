-- CORREÇÃO ESPECÍFICA PARA TABELA COMMUNICATIONS
-- Execute este script no Supabase Dashboard > SQL Editor

-- Verificar se a tabela existe
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'communications'
ORDER BY ordinal_position;

-- Se não existir resultado acima, a tabela não existe - executar criação:
CREATE TABLE IF NOT EXISTS public.communications (
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

-- Corrigir nome da coluna se necessário (renomear condominium_id para condo_id)
DO $$
BEGIN
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
        ALTER TABLE public.communications RENAME COLUMN condominium_id TO condo_id;
        RAISE NOTICE 'Coluna renomeada de condominium_id para condo_id';
    END IF;
END $$;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_communications_condo_id ON public.communications(condo_id);
CREATE INDEX IF NOT EXISTS idx_communications_created_by ON public.communications(created_by);

-- Habilitar RLS
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view communications from their condominiums" ON public.communications;
DROP POLICY IF EXISTS "Users can insert communications in their condominiums" ON public.communications;
DROP POLICY IF EXISTS "Users can update communications from their condominiums" ON public.communications;
DROP POLICY IF EXISTS "Users can delete communications from their condominiums" ON public.communications;

-- Criar políticas RLS
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

-- Verificação final
SELECT 
    'SUCCESS: Tabela communications configurada!' as status,
    COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'communications';

-- Verificar estrutura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'communications'
ORDER BY ordinal_position;