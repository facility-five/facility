-- Add description column to blocks table
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN blocks.description IS 'Descrição opcional do bloco';
