-- Adicionar política RLS para permitir que usuários criem seu próprio profile
-- Isso é necessário para o fluxo de login quando o profile não existe

-- Política para permitir INSERT do próprio profile
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Política para permitir que Admin do SaaS insira profiles de outros usuários
DROP POLICY IF EXISTS "profiles_insert_admin" ON public.profiles;
CREATE POLICY "profiles_insert_admin" ON public.profiles
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'Admin do SaaS'
        )
    );
