-- Script para verificar quais colunas existem na tabela units
-- Execute este SQL no SQL Editor do Supabase Dashboard

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'units'
ORDER BY ordinal_position;
