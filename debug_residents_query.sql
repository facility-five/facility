-- Debug: Verificar dados na tabela residents
SELECT COUNT(*) as total_residents FROM residents;

-- Verificar estrutura da tabela residents
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'residents'
ORDER BY ordinal_position;

-- Verificar dados básicos
SELECT id, first_name, last_name, email, status, unit_id, created_at
FROM residents
LIMIT 10;

-- Verificar relacionamentos
SELECT 
    r.id,
    r.first_name,
    r.last_name,
    r.email,
    r.status,
    u.number as unit_number,
    b.name as block_name,
    c.name as condominium_name,
    a.name as administrator_name
FROM residents r
LEFT JOIN units u ON r.unit_id = u.id
LEFT JOIN blocks b ON u.block_id = b.id
LEFT JOIN condominiums c ON b.condominium_id = c.id
LEFT JOIN administrators a ON c.administrator_id = a.id
LIMIT 5;

-- Verificar se há RLS bloqueando
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'residents';

-- Verificar políticas RLS da tabela residents
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'residents';