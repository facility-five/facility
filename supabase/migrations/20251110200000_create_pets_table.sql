-- Criar tabela de pets/mascotas
CREATE TABLE IF NOT EXISTS public.pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    age INTEGER,
    weight DECIMAL(5,2),
    color TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
    condo_id UUID NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Trigger para atualização automática da coluna updated_at
CREATE TRIGGER set_pets_updated_at
    BEFORE UPDATE ON public.pets
    FOR EACH ROW
    EXECUTE FUNCTION public.moddatetime(updated_at);

-- Índices para performance
CREATE INDEX IF NOT EXISTS pets_unit_id_idx ON public.pets(unit_id);
CREATE INDEX IF NOT EXISTS pets_resident_id_idx ON public.pets(resident_id);
CREATE INDEX IF NOT EXISTS pets_condo_id_idx ON public.pets(condo_id);
CREATE INDEX IF NOT EXISTS pets_species_idx ON public.pets(species);
CREATE INDEX IF NOT EXISTS pets_status_idx ON public.pets(status);
CREATE INDEX IF NOT EXISTS pets_deleted_at_idx ON public.pets(deleted_at) WHERE deleted_at IS NULL;

-- RLS (Row Level Security)
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam pets dos condomínios de suas administradoras
CREATE POLICY "Pets podem ser visualizados por administradoras" ON public.pets
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.condominiums c
        INNER JOIN public.administrators a ON c.administrator_id = a.id
        WHERE c.id = pets.condo_id 
        AND a.user_id = auth.uid()
    )
);

-- Política para permitir que usuários insiram pets nos condomínios de suas administradoras
CREATE POLICY "Pets podem ser criados por administradoras" ON public.pets
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.condominiums c
        INNER JOIN public.administrators a ON c.administrator_id = a.id
        WHERE c.id = condo_id 
        AND a.user_id = auth.uid()
    )
);

-- Política para permitir que usuários atualizem pets dos condomínios de suas administradoras
CREATE POLICY "Pets podem ser atualizados por administradoras" ON public.pets
FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.condominiums c
        INNER JOIN public.administrators a ON c.administrator_id = a.id
        WHERE c.id = pets.condo_id 
        AND a.user_id = auth.uid()
    )
);

-- Política para permitir que usuários deletem pets dos condomínios de suas administradoras
CREATE POLICY "Pets podem ser deletados por administradoras" ON public.pets
FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.condominiums c
        INNER JOIN public.administrators a ON c.administrator_id = a.id
        WHERE c.id = pets.condo_id 
        AND a.user_id = auth.uid()
    )
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pets TO authenticated;
GRANT USAGE ON SEQUENCE public.pets_id_seq TO authenticated;