-- Alinhar a estrutura para que o morador seja usuário com papel de morador
-- 1) Adiciona/garante coluna user_type em profiles
-- 2) Atualiza função de criação automática de perfil para preencher user_type
-- 3) Atualiza função de criação de conta de morador para definir role e user_type
-- 4) Libera atualização do próprio registro em residents via RLS

-- 1) Coluna user_type em profiles (idempotente)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_type TEXT;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_type_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_user_type_check
      CHECK (user_type IN ('tenant','administrator','manager','resident'));
  END IF;
END $$;

ALTER TABLE public.profiles ALTER COLUMN user_type SET DEFAULT 'tenant';

-- 2) Atualiza função de criação automática de perfil para incluir user_type
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        first_name,
        last_name,
        email,
        whatsapp,
        role,
        status,
        last_sign_in_at,
        user_type
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'Morador'),
        COALESCE(NEW.raw_user_meta_data->>'status', 'Ativo'),
        NEW.last_sign_in_at,
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'tenant')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3) Atualiza função de criação de conta de morador para definir role e user_type
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
    -- Tentar localizar usuário existente por email
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
        -- Criar novo usuário com metadados indicando papel de morador
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
                'role', 'Morador',
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

-- 4) Permitir que o morador atualize seus próprios dados em residents
DROP POLICY IF EXISTS "Residents can update own data" ON public.residents;
CREATE POLICY "Residents can update own data"
    ON public.residents FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());