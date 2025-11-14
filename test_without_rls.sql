-- TESTE EMERGENCIAL - REMOVER RLS TEMPORARIAMENTE
-- Execute apenas para teste, depois reative o RLS

-- 1. Desabilitar RLS temporariamente
ALTER TABLE public.resident_requests DISABLE ROW LEVEL SECURITY;

-- 2. Testar atualização direta (substitua pelo ID real)
-- UPDATE public.resident_requests 
-- SET status = 'em_andamento', resolution_notes = 'Teste sem RLS'
-- WHERE title = 'Vazamento';

-- 3. Verificar se funcionou
SELECT id, title, status, resolution_notes, condominium_id
FROM public.resident_requests 
WHERE title LIKE '%Vazamento%';

RAISE NOTICE 'RLS DESABILITADO! Teste a atualização agora. LEMBRE-SE DE REABILITAR DEPOIS!';