DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'dados_wagner'
    ) THEN
        CREATE TABLE public.dados_wagner (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;