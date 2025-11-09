-- Script para aplicar a coluna description na tabela blocks
-- Execute este SQL no SQL Editor do Supabase Dashboard

ALTER TABLE blocks ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN blocks.description IS 'Descrição opcional do bloco';

-- Verificar se a coluna foi criada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'blocks' AND column_name = 'description';
