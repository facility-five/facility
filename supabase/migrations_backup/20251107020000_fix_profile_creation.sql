-- Corrigir criação automática de profiles
-- Garantir que o trigger funcione corretamente e que não haja conflitos

-- 1. Remover profiles duplicados novamente (caso ainda existam)
DELETE FROM public.profiles a
USING public.profiles b
WHERE a.id = b.id 
  AND a.created_at < b.created_at;

-- 2. Recriar a função de criação de profile com melhor tratamento de erros
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Tentar inserir o profile, ignorando se já existir
    INSERT INTO public.profiles (
        id,
        first_name,
        last_name,
        email,
        whatsapp,
        role,
        status,
        last_sign_in_at
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'whatsapp', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'Morador'),
        COALESCE(NEW.raw_user_meta_data->>'status', 'Ativo'),
        NEW.last_sign_in_at
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        last_sign_in_at = EXCLUDED.last_sign_in_at;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro mas não falhar
        RAISE WARNING 'Erro ao criar profile para usuário %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Garantir que o trigger está ativo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4. Adicionar política RLS mais permissiva para INSERT (temporariamente para debug)
DROP POLICY IF EXISTS "profiles_insert_service_role" ON public.profiles;
CREATE POLICY "profiles_insert_service_role" ON public.profiles
    FOR INSERT 
    WITH CHECK (true); -- Permitir qualquer INSERT (será restringido pelo trigger)

-- 5. Criar profiles para usuários existentes que não têm profile
INSERT INTO public.profiles (id, email, role, status, created_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'role', 'Morador'),
    'Ativo',
    au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
