-- Corrigir recursão infinita nas políticas RLS
-- O problema é que as políticas estão verificando a própria tabela profiles

-- 1. Desabilitar RLS temporariamente para limpar
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_service_role" ON public.profiles;

-- 3. Criar políticas simples SEM recursão
-- SELECT: Usuário pode ver próprio profile
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT 
    USING (auth.uid() = id);

-- INSERT: Qualquer usuário autenticado pode inserir próprio profile
CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- UPDATE: Usuário pode atualizar próprio profile
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE 
    USING (auth.uid() = id);

-- DELETE: Usuário pode deletar próprio profile
CREATE POLICY "profiles_delete_own" ON public.profiles
    FOR DELETE 
    USING (auth.uid() = id);

-- 4. Reabilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Garantir que todos os usuários têm profile
INSERT INTO public.profiles (id, email, role, status, created_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'role', 'Morador'),
    'Ativo',
    COALESCE(au.created_at, NOW())
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;
