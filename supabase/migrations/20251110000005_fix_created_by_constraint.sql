-- Tornar a coluna created_by opcional ou adicionar valor padrão
DO $$ 
BEGIN
    -- Opção 1: Tornar a coluna nullable
    ALTER TABLE public.reservas ALTER COLUMN created_by DROP NOT NULL;
    
    -- Opção 2: Adicionar valor padrão (caso prefira manter NOT NULL)
    -- ALTER TABLE public.reservas ALTER COLUMN created_by SET DEFAULT '00000000-0000-0000-0000-000000000000';
    
END $$;