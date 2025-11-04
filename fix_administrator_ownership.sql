-- Script para corrigir o owner_id e responsible_id da administradora Test2
-- Usuário atual: 1d4fb122-6067-4b61-b191-4a2fe5bc654f
-- Administradora: f4604273-b2d4-4d80-acb3-a61887a7dd7

UPDATE administrators 
SET 
  user_id = '1d4fb122-6067-4b61-b191-4a2fe5bc654f',
  responsible_id = '1d4fb122-6067-4b61-b191-4a2fe5bc654f'
WHERE id = 'f4604273-b2d4-4d80-acb3-a61887a7dd7';

-- Verificar a atualização
SELECT id, name, user_id, responsible_id 
FROM administrators 
WHERE id = 'f4604273-b2d4-4d80-acb3-a61887a7dd7';