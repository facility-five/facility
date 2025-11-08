-- Fix administrators RLS policies to support user_id and responsible_id fields
-- Drop existing policies
DROP POLICY IF EXISTS "Usuários podem ver suas próprias administradoras" ON public.administrators;
DROP POLICY IF EXISTS "Usuários podem criar suas próprias administradoras" ON public.administrators;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias administradoras" ON public.administrators;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias administradoras" ON public.administrators;

-- Create new policies that support user_id, responsible_id, and tenant_id
CREATE POLICY "Users can view their administrators"
    ON public.administrators FOR SELECT
    USING (
        auth.uid() = tenant_id 
        OR auth.uid() = user_id 
        OR auth.uid() = responsible_id
    );

CREATE POLICY "Users can create their administrators"
    ON public.administrators FOR INSERT
    WITH CHECK (
        auth.uid() = tenant_id 
        OR auth.uid() = user_id 
        OR auth.uid() = responsible_id
    );

CREATE POLICY "Users can update their administrators"
    ON public.administrators FOR UPDATE
    USING (
        auth.uid() = tenant_id 
        OR auth.uid() = user_id 
        OR auth.uid() = responsible_id
    );

CREATE POLICY "Users can delete their administrators"
    ON public.administrators FOR DELETE
    USING (
        auth.uid() = tenant_id 
        OR auth.uid() = user_id 
        OR auth.uid() = responsible_id
    );
