-- Garantir que a tabela reservations existe
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    common_area_id UUID NOT NULL REFERENCES public.common_areas(id) ON DELETE CASCADE,
    resident_id UUID NOT NULL REFERENCES public.residents(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    guests_count INT DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'cancelled')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
    amount NUMERIC(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_reservations_common_area_id ON public.reservations(common_area_id);
CREATE INDEX IF NOT EXISTS idx_reservations_resident_id ON public.reservations(resident_id);
CREATE INDEX IF NOT EXISTS idx_reservations_unit_id ON public.reservations(unit_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_deleted_at ON public.reservations(deleted_at);

-- RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Políticas para moradores (podem ver e criar suas próprias reservas)
CREATE POLICY IF NOT EXISTS "Residents can view own reservations"
    ON public.reservations FOR SELECT
    USING (
        resident_id IN (
            SELECT id FROM public.residents WHERE user_id = auth.uid()
        )
    );

CREATE POLICY IF NOT EXISTS "Residents can create own reservations"
    ON public.reservations FOR INSERT
    WITH CHECK (
        resident_id IN (
            SELECT id FROM public.residents WHERE user_id = auth.uid()
        )
    );

CREATE POLICY IF NOT EXISTS "Residents can update own reservations"
    ON public.reservations FOR UPDATE
    USING (
        resident_id IN (
            SELECT id FROM public.residents WHERE user_id = auth.uid()
        )
    );

-- Políticas para administradores (acesso total às reservas de suas administradoras)
CREATE POLICY IF NOT EXISTS "Administrators can view all reservations"
    ON public.reservations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.common_areas ca
            JOIN public.condominiums c ON ca.condo_id = c.id
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE ca.id = reservations.common_area_id
            AND a.tenant_id = auth.uid()
        )
    );

CREATE POLICY IF NOT EXISTS "Administrators can insert reservations"
    ON public.reservations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.common_areas ca
            JOIN public.condominiums c ON ca.condo_id = c.id
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE ca.id = reservations.common_area_id
            AND a.tenant_id = auth.uid()
        )
    );

CREATE POLICY IF NOT EXISTS "Administrators can update reservations"
    ON public.reservations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.common_areas ca
            JOIN public.condominiums c ON ca.condo_id = c.id
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE ca.id = reservations.common_area_id
            AND a.tenant_id = auth.uid()
        )
    );

CREATE POLICY IF NOT EXISTS "Administrators can delete reservations"
    ON public.reservations FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.common_areas ca
            JOIN public.condominiums c ON ca.condo_id = c.id
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE ca.id = reservations.common_area_id
            AND a.tenant_id = auth.uid()
        )
    );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_reservations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_reservations_updated_at_trigger ON public.reservations;
CREATE TRIGGER update_reservations_updated_at_trigger
    BEFORE UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_reservations_updated_at();
