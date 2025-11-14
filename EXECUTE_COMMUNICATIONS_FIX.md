# INSTRUÇÕES PARA EXECUTAR CORREÇÃO DA TABELA COMMUNICATIONS

## ⚠️ PROBLEMA ENCONTRADO
O Supabase CLI tem algumas migrations conflitantes e não consegue aplicar a migration automaticamente.

## ✅ SOLUÇÃO MANUAL

### 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard/
- Selecione o projeto "Facility"

### 2. Execute no SQL Editor
Copie e cole o seguinte código no SQL Editor:

```sql
-- VERIFICAÇÃO E CORREÇÃO DA TABELA COMMUNICATIONS
-- 1. Verificar estrutura atual
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'communications'
ORDER BY ordinal_position;

-- 2. Se a tabela não existir, criar
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'communications'
    ) THEN
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

        CREATE INDEX idx_communications_condo_id ON public.communications(condo_id);
        CREATE INDEX idx_communications_created_by ON public.communications(created_by);
        
        RAISE NOTICE 'Tabela communications criada';
    END IF;
END $$;

-- 3. Corrigir coluna se necessário
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
        RAISE NOTICE 'Coluna renomeada para condo_id';
    END IF;
END $$;

-- 4. Habilitar RLS e políticas
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view communications from their condominiums" ON public.communications;
DROP POLICY IF EXISTS "Users can insert communications in their condominiums" ON public.communications;
DROP POLICY IF EXISTS "Users can update communications from their condominiums" ON public.communications;
DROP POLICY IF EXISTS "Users can delete communications from their condominiums" ON public.communications;

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

-- 5. Verificação final
SELECT 
    'OK - Tabela communications configurada!' as status,
    COUNT(*) as total_comunicados
FROM public.communications;
```

### 3. Após executar
- ✅ Você deve ver "OK - Tabela communications configurada!"
- ✅ A estrutura da tabela deve estar correta com `condo_id`
- ✅ As políticas RLS devem estar ativas

## 🚀 PRÓXIMOS PASSOS
Após executar o script, tente criar um comunicado no frontend para verificar se o erro HTTP 400 foi resolvido.