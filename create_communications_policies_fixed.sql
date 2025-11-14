-- Primeiro, verificar políticas existentes
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE tablename = 'communications';

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view communications from their condominiums" ON public.communications;
DROP POLICY IF EXISTS "Users can insert communications in their condominiums" ON public.communications;
DROP POLICY IF EXISTS "Users can update communications from their condominiums" ON public.communications;
DROP POLICY IF EXISTS "Users can delete communications from their condominiums" ON public.communications;

-- Criar políticas RLS corretas
CREATE POLICY "Users can view communications from their condominiums"
    ON public.communications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.condominiums c
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE c.id = communications.condo_id
            AND (a.user_id = auth.uid() OR a.responsible_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert communications in their condominiums"
    ON public.communications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.condominiums c
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE c.id = communications.condo_id
            AND (a.user_id = auth.uid() OR a.responsible_id = auth.uid())
        )
    );

CREATE POLICY "Users can update communications from their condominiums"
    ON public.communications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.condominiums c
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE c.id = communications.condo_id
            AND (a.user_id = auth.uid() OR a.responsible_id = auth.uid())
        )
    );

CREATE POLICY "Users can delete communications from their condominiums"
    ON public.communications FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.condominiums c
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE c.id = communications.condo_id
            AND (a.user_id = auth.uid() OR a.responsible_id = auth.uid())
        )
    );

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE tablename = 'communications';

-- Confirmar que RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'communications';