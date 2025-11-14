-- PASSO 1: Verificar se a tabela communications existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'communications';

-- PASSO 2: Se existir, ver as colunas atuais
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'communications'
ORDER BY ordinal_position;