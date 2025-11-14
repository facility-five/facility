-- Implementar estrutura de moradores e suas funcionalidades
-- Cada unidade pode ter múltiplos moradores
-- Moradores podem ter diferentes tipos (proprietário, inquilino, dependente)
-- Moradores podem fazer solicitações, reservas, etc.

-- 1. Melhorar a tabela de perfis para incluir tipo de usuário
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_type TEXT CHECK (user_type IN ('tenant', 'administrator', 'manager', 'resident')) DEFAULT 'tenant',
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 2. Tabela de moradores (residents)
CREATE TABLE IF NOT EXISTS public.residents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    administrator_id UUID NOT NULL REFERENCES public.administrators(id),
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    document_type TEXT,
    document_number TEXT,
    birth_date DATE,
    is_owner BOOLEAN DEFAULT false,
    is_tenant BOOLEAN DEFAULT false,
    is_dependent BOOLEAN DEFAULT false,
    resident_since DATE DEFAULT CURRENT_DATE,
    resident_until DATE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    CONSTRAINT resident_document_unique UNIQUE (document_type, document_number),
    CONSTRAINT resident_must_have_role CHECK (is_owner OR is_tenant OR is_dependent)
);

-- 3. Tabela de solicitações (requests)
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES public.residents(id),
    unit_id UUID NOT NULL REFERENCES public.units(id),
    administrator_id UUID NOT NULL REFERENCES public.administrators(id),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    priority TEXT DEFAULT 'normal',
    status TEXT DEFAULT 'pending',
    assigned_to UUID REFERENCES auth.users(id),
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 4. Tabela de áreas comuns (common_areas)
CREATE TABLE IF NOT EXISTS public.common_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condominium_id UUID NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    capacity INT,
    opening_time TIME,
    closing_time TIME,
    reservation_required BOOLEAN DEFAULT true,
    reservation_max_hours INT,
    price_per_hour NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 5. Tabela de reservas (reservations)
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    common_area_id UUID NOT NULL REFERENCES public.common_areas(id),
    resident_id UUID NOT NULL REFERENCES public.residents(id),
    unit_id UUID NOT NULL REFERENCES public.units(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    guests_count INT DEFAULT 0,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    amount NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT no_overlapping_reservations EXCLUDE USING gist (
        common_area_id WITH =,
        tsrange(date + start_time, date + end_time) WITH &&
    ) WHERE (status = 'approved' AND deleted_at IS NULL)
);

-- 6. Tabela de documentos do morador
CREATE TABLE IF NOT EXISTS public.resident_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES public.residents(id),
    type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    expires_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 7. Tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 8. Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_residents_unit_id ON public.residents(unit_id);
CREATE INDEX IF NOT EXISTS idx_residents_administrator_id ON public.residents(administrator_id);
CREATE INDEX IF NOT EXISTS idx_requests_resident_id ON public.requests(resident_id);
CREATE INDEX IF NOT EXISTS idx_requests_unit_id ON public.requests(unit_id);
CREATE INDEX IF NOT EXISTS idx_requests_administrator_id ON public.requests(administrator_id);
CREATE INDEX IF NOT EXISTS idx_common_areas_condominium_id ON public.common_areas(condominium_id);
CREATE INDEX IF NOT EXISTS idx_reservations_common_area_id ON public.reservations(common_area_id);
CREATE INDEX IF NOT EXISTS idx_reservations_resident_id ON public.reservations(resident_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- 9. RLS Policies para moradores

-- Residents
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;

-- Administradores podem ver todos os moradores de suas administradoras
CREATE POLICY "Administrators can view all residents"
    ON public.residents FOR SELECT
    USING (administrator_id IN (
        SELECT id FROM public.administrators WHERE tenant_id = auth.uid()
    ));

-- Moradores podem ver apenas seus próprios dados
CREATE POLICY "Residents can view own data"
    ON public.residents FOR SELECT
    USING (user_id = auth.uid());

-- Requests
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Moradores podem ver suas próprias solicitações
CREATE POLICY "Residents can view own requests"
    ON public.requests FOR SELECT
    USING (resident_id IN (
        SELECT id FROM public.residents WHERE user_id = auth.uid()
    ));

-- Administradores podem ver todas as solicitações de suas administradoras
CREATE POLICY "Administrators can view all requests"
    ON public.requests FOR SELECT
    USING (administrator_id IN (
        SELECT id FROM public.administrators WHERE tenant_id = auth.uid()
    ));

-- Common Areas
ALTER TABLE public.common_areas ENABLE ROW LEVEL SECURITY;

-- Moradores podem ver áreas comuns do seu condomínio
CREATE POLICY "Residents can view common areas"
    ON public.common_areas FOR SELECT
    USING (condominium_id IN (
        SELECT c.id 
        FROM public.condominiums c
        JOIN public.blocks b ON b.condominium_id = c.id
        JOIN public.units u ON u.block_id = b.id
        JOIN public.residents r ON r.unit_id = u.id
        WHERE r.user_id = auth.uid()
    ));

-- Administradores podem ver e gerenciar áreas comuns
CREATE POLICY "Administrators can manage common areas"
    ON public.common_areas FOR ALL
    USING (condominium_id IN (
        SELECT c.id 
        FROM public.condominiums c
        JOIN public.administrators a ON c.administrator_id = a.id
        WHERE a.tenant_id = auth.uid()
    ));

-- Reservations
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Moradores podem ver suas próprias reservas
CREATE POLICY "Residents can view own reservations"
    ON public.reservations FOR SELECT
    USING (resident_id IN (
        SELECT id FROM public.residents WHERE user_id = auth.uid()
    ));

-- Administradores podem ver todas as reservas
CREATE POLICY "Administrators can view all reservations"
    ON public.reservations FOR SELECT
    USING (common_area_id IN (
        SELECT ca.id
        FROM public.common_areas ca
        JOIN public.condominiums c ON ca.condominium_id = c.id
        JOIN public.administrators a ON c.administrator_id = a.id
        WHERE a.tenant_id = auth.uid()
    ));

-- 10. Função para criar conta de morador
CREATE OR REPLACE FUNCTION create_resident_account(
    p_email TEXT,
    p_password TEXT,
    p_full_name TEXT,
    p_unit_id UUID,
    p_administrator_id UUID,
    p_is_owner BOOLEAN DEFAULT false,
    p_is_tenant BOOLEAN DEFAULT false,
    p_is_dependent BOOLEAN DEFAULT false
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_resident_id UUID;
BEGIN
    -- Criar usuário no auth.users
    v_user_id := (
        SELECT id FROM auth.users
        WHERE email = p_email
        LIMIT 1
    );
    
    IF v_user_id IS NULL THEN
        v_user_id := (
            SELECT id FROM auth.users
            WHERE raw_user_meta_data->>'email' = p_email
            LIMIT 1
        );
    END IF;
    
    IF v_user_id IS NULL THEN
        -- Criar novo usuário
        v_user_id := extensions.uuid_generate_v4();
        
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_user_meta_data
        )
        VALUES (
            v_user_id,
            p_email,
            crypt(p_password, gen_salt('bf')),
            NOW(),
            jsonb_build_object(
                'full_name', p_full_name,
                'user_type', 'resident'
            )
        );
    END IF;
    
    -- Criar perfil do morador
    INSERT INTO public.residents (
        user_id,
        unit_id,
        administrator_id,
        full_name,
        email,
        is_owner,
        is_tenant,
        is_dependent,
        status,
        created_by
    )
    VALUES (
        v_user_id,
        p_unit_id,
        p_administrator_id,
        p_full_name,
        p_email,
        p_is_owner,
        p_is_tenant,
        p_is_dependent,
        'active',
        auth.uid()
    )
    RETURNING id INTO v_resident_id;
    
    RETURN v_resident_id;
END;
$$;