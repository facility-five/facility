-- SOLUÇÃO DEFINITIVA PARA ATUALIZAÇÃO DE SOLICITAÇÕES
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. Verificar se a tabela existe e sua estrutura
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'resident_requests'
ORDER BY ordinal_position;

-- 2. Desabilitar RLS temporariamente para limpeza
ALTER TABLE public.resident_requests DISABLE ROW LEVEL SECURITY;

-- 3. Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Administrators can view condo requests" ON public.resident_requests;
DROP POLICY IF EXISTS "Administrators can update condo requests" ON public.resident_requests;
DROP POLICY IF EXISTS "Residents can view own requests" ON public.resident_requests;
DROP POLICY IF EXISTS "Residents can insert own requests" ON public.resident_requests;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.resident_requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.resident_requests;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.resident_requests;

-- 4. Verificar se as colunas necessárias existem e criar se necessário
DO $$
BEGIN
    -- Verificar se status existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'resident_requests' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.resident_requests ADD COLUMN status TEXT DEFAULT 'pendente';
    END IF;
    
    -- Verificar se resolution_notes existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'resident_requests' 
        AND column_name = 'resolution_notes'
    ) THEN
        ALTER TABLE public.resident_requests ADD COLUMN resolution_notes TEXT;
    END IF;
END $$;

-- 5. Reabilitar RLS
ALTER TABLE public.resident_requests ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas simples e funcionais
-- Administradores podem ver solicitações de seus condomínios
CREATE POLICY "admin_view_requests" ON public.resident_requests
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.condominiums c
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE c.id = resident_requests.condominium_id
            AND (a.user_id = auth.uid() OR a.responsible_id = auth.uid())
        )
    );

-- Administradores podem atualizar solicitações de seus condomínios
CREATE POLICY "admin_update_requests" ON public.resident_requests
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.condominiums c
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE c.id = resident_requests.condominium_id
            AND (a.user_id = auth.uid() OR a.responsible_id = auth.uid())
        )
    );

-- Moradores podem ver suas próprias solicitações
CREATE POLICY "resident_view_own_requests" ON public.resident_requests
    FOR SELECT
    USING (resident_id = auth.uid());

-- Moradores podem criar suas próprias solicitações
CREATE POLICY "resident_insert_own_requests" ON public.resident_requests
    FOR INSERT
    WITH CHECK (resident_id = auth.uid());

-- 7. Verificar políticas criadas
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE tablename = 'resident_requests';

-- 8. Teste de atualização (substitua pelos IDs reais)
-- UPDATE public.resident_requests 
-- SET status = 'em_andamento', resolution_notes = 'Teste de atualização'
-- WHERE id = 'SUBSTITUA_PELO_ID_REAL';

RAISE NOTICE 'Configuração concluída! Agora teste a atualização das solicitações.';