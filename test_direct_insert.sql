-- Teste direto de inserção na tabela communications
-- Execute este para testar se a inserção funciona no banco

-- 1. Verificar se existe condomínio e administrador
SELECT 
    c.id as condo_id,
    c.name as condo_name,
    a.id as admin_id,
    a.user_id,
    a.responsible_id
FROM public.condominiums c
JOIN public.administrators a ON c.administrator_id = a.id
LIMIT 5;

-- 2. Verificar usuário atual
SELECT auth.uid() as current_user_id;

-- 3. Teste de inserção com dados manuais
-- SUBSTITUA os valores pelos IDs reais do resultado acima
INSERT INTO public.communications (
    title,
    content,
    condo_id,
    created_by,
    expiration_date
) VALUES (
    'Teste Manual',
    'Conteúdo de teste',
    'SUBSTITUA_PELO_CONDO_ID_REAL',
    auth.uid(),
    '2025-12-05'
);

-- 4. Verificar se foi inserido
SELECT * FROM public.communications WHERE title = 'Teste Manual';