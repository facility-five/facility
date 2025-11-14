-- Implementar estrutura multi-tenant com hierarquia completa
-- Cada tenant (usuário) pode ter múltiplas administradoras
-- Cada administradora pode ter múltiplos condomínios
-- Cada condomínio pode ter múltiplos blocos
-- Cada bloco pode ter múltiplas unidades

-- 1. Garantir que a tabela de usuários (auth.users) existe
-- Já existe por padrão no Supabase

-- 2. Melhorar a tabela de profiles para suportar multi-tenant
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_document TEXT,
ADD COLUMN IF NOT EXISTS company_phone TEXT,
ADD COLUMN IF NOT EXISTS company_email TEXT,
ADD COLUMN IF NOT EXISTS company_website TEXT,
ADD COLUMN IF NOT EXISTS company_logo TEXT,
ADD COLUMN IF NOT EXISTS company_address TEXT,
ADD COLUMN IF NOT EXISTS company_city TEXT,
ADD COLUMN IF NOT EXISTS company_state TEXT,
ADD COLUMN IF NOT EXISTS company_country TEXT DEFAULT 'España',
ADD COLUMN IF NOT EXISTS company_postal_code TEXT;

-- 3. Melhorar a tabela de administradoras
CREATE TABLE IF NOT EXISTS public.administrators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    nif TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    logo TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'España',
    postal_code TEXT,
    responsible_name TEXT,
    responsible_email TEXT,
    responsible_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    CONSTRAINT administrator_tenant_name_unique UNIQUE (tenant_id, name)
);

-- 4. Melhorar a tabela de condomínios
CREATE TABLE IF NOT EXISTS public.condominiums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    administrator_id UUID NOT NULL REFERENCES public.administrators(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    nif TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    logo TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'España',
    postal_code TEXT,
    area NUMERIC,
    type TEXT,
    total_blocks INT DEFAULT 0,
    total_units INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    CONSTRAINT condominium_administrator_name_unique UNIQUE (administrator_id, name)
);

-- 5. Melhorar a tabela de blocos
CREATE TABLE IF NOT EXISTS public.blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condominium_id UUID NOT NULL REFERENCES public.condominiums(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    number_of_floors INT,
    total_units INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    CONSTRAINT block_condominium_name_unique UNIQUE (condominium_id, name)
);

-- 6. Melhorar a tabela de unidades
CREATE TABLE IF NOT EXISTS public.units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    block_id UUID NOT NULL REFERENCES public.blocks(id) ON DELETE CASCADE,
    number TEXT NOT NULL,
    floor INT,
    area NUMERIC,
    bedrooms INT,
    bathrooms INT,
    parking_spots INT,
    type TEXT,
    status TEXT DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT unit_block_number_unique UNIQUE (block_id, number)
);

-- 7. Melhorar a tabela de planos
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    interval TEXT DEFAULT 'month',
    currency TEXT DEFAULT 'EUR',
    features JSONB DEFAULT '[]'::jsonb,
    max_administrators INT,
    max_condos INT,
    max_blocks INT,
    max_units INT,
    max_users INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active'
);

-- 8. Garantir que a tabela de pagamentos está correta
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id),
    amount NUMERIC NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'EUR',
    interval TEXT DEFAULT 'month',
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    payment_intent_id TEXT,
    subscription_id TEXT,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT payment_subscription_unique UNIQUE (subscription_id)
);

-- 9. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_administrators_tenant_id ON public.administrators(tenant_id);
CREATE INDEX IF NOT EXISTS idx_condominiums_administrator_id ON public.condominiums(administrator_id);
CREATE INDEX IF NOT EXISTS idx_blocks_condominium_id ON public.blocks(condominium_id);
CREATE INDEX IF NOT EXISTS idx_units_block_id ON public.units(block_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_plan_id ON public.payments(plan_id);

-- 10. Funções auxiliares para contagens
CREATE OR REPLACE FUNCTION update_condominium_counts() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Atualizar contadores do condomínio
        UPDATE public.condominiums
        SET total_blocks = total_blocks + 1
        WHERE id = NEW.condominium_id;
    ELSIF TG_OP = 'DELETE' THEN
        -- Diminuir contadores
        UPDATE public.condominiums
        SET total_blocks = total_blocks - 1
        WHERE id = OLD.condominium_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_block_counts() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Atualizar contadores do bloco
        UPDATE public.blocks
        SET total_units = total_units + 1
        WHERE id = NEW.block_id;
        
        -- Atualizar contadores do condomínio
        UPDATE public.condominiums c
        SET total_units = total_units + 1
        FROM public.blocks b
        WHERE b.id = NEW.block_id AND c.id = b.condominium_id;
    ELSIF TG_OP = 'DELETE' THEN
        -- Diminuir contadores
        UPDATE public.blocks
        SET total_units = total_units - 1
        WHERE id = OLD.block_id;
        
        UPDATE public.condominiums c
        SET total_units = total_units - 1
        FROM public.blocks b
        WHERE b.id = OLD.block_id AND c.id = b.condominium_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Triggers para manter contagens atualizadas
DROP TRIGGER IF EXISTS tr_blocks_after_insert_update ON public.blocks;
CREATE TRIGGER tr_blocks_after_insert_update
    AFTER INSERT OR DELETE ON public.blocks
    FOR EACH ROW EXECUTE FUNCTION update_condominium_counts();

DROP TRIGGER IF EXISTS tr_units_after_insert_update ON public.units;
CREATE TRIGGER tr_units_after_insert_update
    AFTER INSERT OR DELETE ON public.units
    FOR EACH ROW EXECUTE FUNCTION update_block_counts();

-- 12. Plano gratuito padrão
INSERT INTO public.plans (
    name,
    description,
    price,
    interval,
    currency,
    features,
    max_administrators,
    max_condos,
    max_blocks,
    max_units,
    max_users,
    status
) VALUES (
    'Plan Gratuito',
    'Plan básico para empezar a gestionar tus propiedades',
    0,
    'month',
    'EUR',
    '["1 administradora", "1 condominio", "5 unidades", "Soporte básico"]',
    1,  -- Uma administradora
    1,  -- Um condomínio
    2,  -- Dois blocos
    5,  -- Cinco unidades
    3,  -- Três usuários
    'active'
) ON CONFLICT DO NOTHING;

-- 13. RLS Policies
-- Administrators
ALTER TABLE public.administrators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver suas próprias administradoras"
    ON public.administrators FOR SELECT
    USING (auth.uid() = tenant_id);

CREATE POLICY "Usuários podem criar suas próprias administradoras"
    ON public.administrators FOR INSERT
    WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Usuários podem atualizar suas próprias administradoras"
    ON public.administrators FOR UPDATE
    USING (auth.uid() = tenant_id);

CREATE POLICY "Usuários podem deletar suas próprias administradoras"
    ON public.administrators FOR DELETE
    USING (auth.uid() = tenant_id);

-- Condominiums
ALTER TABLE public.condominiums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem ver condomínios de suas administradoras"
    ON public.condominiums FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.administrators
        WHERE administrators.id = condominiums.administrator_id
        AND administrators.tenant_id = auth.uid()
    ));

CREATE POLICY "Usuários podem criar condomínios em suas administradoras"
    ON public.condominiums FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.administrators
        WHERE administrators.id = condominiums.administrator_id
        AND administrators.tenant_id = auth.uid()
    ));

-- Similar policies for blocks and units...

-- 14. Função para verificar limites do plano
CREATE OR REPLACE FUNCTION check_plan_limits()
RETURNS TRIGGER AS $$
DECLARE
    _plan_id UUID;
    _max_allowed INT;
    _current_count INT;
    _entity_type TEXT;
BEGIN
    -- Identificar o tipo de entidade sendo criada
    CASE TG_TABLE_NAME
        WHEN 'administrators' THEN _entity_type := 'administrators';
        WHEN 'condominiums' THEN _entity_type := 'condominiums';
        WHEN 'blocks' THEN _entity_type := 'blocks';
        WHEN 'units' THEN _entity_type := 'units';
        ELSE RAISE EXCEPTION 'Tipo de entidade não suportado';
    END CASE;

    -- Buscar o plano ativo do usuário
    SELECT plan_id INTO _plan_id
    FROM public.payments
    WHERE user_id = auth.uid()
    AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;

    -- Se não encontrar plano ativo, usar plano gratuito
    IF _plan_id IS NULL THEN
        SELECT id INTO _plan_id
        FROM public.plans
        WHERE price = 0 AND status = 'active'
        ORDER BY created_at DESC
        LIMIT 1;
    END IF;

    -- Buscar limite do plano
    CASE _entity_type
        WHEN 'administrators' THEN
            SELECT max_administrators INTO _max_allowed FROM public.plans WHERE id = _plan_id;
            SELECT COUNT(*) INTO _current_count FROM public.administrators WHERE tenant_id = auth.uid() AND deleted_at IS NULL;
        WHEN 'condominiums' THEN
            SELECT max_condos INTO _max_allowed FROM public.plans WHERE id = _plan_id;
            SELECT COUNT(*) INTO _current_count 
            FROM public.condominiums c
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE a.tenant_id = auth.uid() AND c.deleted_at IS NULL;
        WHEN 'blocks' THEN
            SELECT max_blocks INTO _max_allowed FROM public.plans WHERE id = _plan_id;
            SELECT COUNT(*) INTO _current_count 
            FROM public.blocks b
            JOIN public.condominiums c ON b.condominium_id = c.id
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE a.tenant_id = auth.uid() AND b.deleted_at IS NULL;
        WHEN 'units' THEN
            SELECT max_units INTO _max_allowed FROM public.plans WHERE id = _plan_id;
            SELECT COUNT(*) INTO _current_count 
            FROM public.units u
            JOIN public.blocks b ON u.block_id = b.id
            JOIN public.condominiums c ON b.condominium_id = c.id
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE a.tenant_id = auth.uid() AND u.deleted_at IS NULL;
    END CASE;

    -- Verificar limite
    IF _current_count >= _max_allowed THEN
        RAISE EXCEPTION 'Limite do plano atingido para %', _entity_type;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger de verificação de limites
CREATE TRIGGER check_administrator_limits
    BEFORE INSERT ON public.administrators
    FOR EACH ROW EXECUTE FUNCTION check_plan_limits();

CREATE TRIGGER check_condominium_limits
    BEFORE INSERT ON public.condominiums
    FOR EACH ROW EXECUTE FUNCTION check_plan_limits();

CREATE TRIGGER check_block_limits
    BEFORE INSERT ON public.blocks
    FOR EACH ROW EXECUTE FUNCTION check_plan_limits();

CREATE TRIGGER check_unit_limits
    BEFORE INSERT ON public.units
    FOR EACH ROW EXECUTE FUNCTION check_plan_limits();