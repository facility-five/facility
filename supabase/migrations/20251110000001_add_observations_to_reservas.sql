-- Adicionar coluna observations à tabela reservas se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reservas' 
        AND column_name = 'observations'
    ) THEN
        ALTER TABLE public.reservas ADD COLUMN observations TEXT;
    END IF;
END $$;

-- Adicionar índice para melhor performance em buscas (opcional)
CREATE INDEX IF NOT EXISTS idx_reservas_observations ON public.reservas USING gin(to_tsvector('portuguese', observations));
