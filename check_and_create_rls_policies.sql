-- Verificar políticas RLS existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'communications';

-- Se não houver políticas, vamos criá-las
-- POLÍTICA PARA SELECT
CREATE POLICY IF NOT EXISTS "Users can view communications from their condominiums"
    ON public.communications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.condominiums c
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE c.id = communications.condo_id
            AND (a.user_id = auth.uid() OR a.responsible_id = auth.uid())
        )
    );

-- POLÍTICA PARA INSERT
CREATE POLICY IF NOT EXISTS "Users can insert communications in their condominiums"
    ON public.communications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.condominiums c
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE c.id = communications.condo_id
            AND (a.user_id = auth.uid() OR a.responsible_id = auth.uid())
        )
    );

-- POLÍTICA PARA UPDATE
CREATE POLICY IF NOT EXISTS "Users can update communications from their condominiums"
    ON public.communications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.condominiums c
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE c.id = communications.condo_id
            AND (a.user_id = auth.uid() OR a.responsible_id = auth.uid())
        )
    );

-- POLÍTICA PARA DELETE
CREATE POLICY IF NOT EXISTS "Users can delete communications from their condominiums"
    ON public.communications FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.condominiums c
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE c.id = communications.condo_id
            AND (a.user_id = auth.uid() OR a.responsible_id = auth.uid())
        )
    );

-- Verificar políticas após criação
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE tablename = 'communications';