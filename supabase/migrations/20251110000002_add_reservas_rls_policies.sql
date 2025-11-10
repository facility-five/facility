-- Habilitar RLS na tabela reservas se ainda não estiver habilitado
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Administrators can view reservas" ON public.reservas;
DROP POLICY IF EXISTS "Administrators can insert reservas" ON public.reservas;
DROP POLICY IF EXISTS "Administrators can update reservas" ON public.reservas;
DROP POLICY IF EXISTS "Administrators can delete reservas" ON public.reservas;
DROP POLICY IF EXISTS "Residents can view own reservas" ON public.reservas;
DROP POLICY IF EXISTS "Residents can insert own reservas" ON public.reservas;

-- Política para administradores verem todas as reservas de suas administradoras
CREATE POLICY "Administrators can view reservas"
    ON public.reservas FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.common_areas ca
            JOIN public.condominiums c ON ca.condo_id = c.id
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE ca.id = reservas.common_area_id
            AND a.tenant_id = auth.uid()
        )
    );

-- Política para administradores inserirem reservas
CREATE POLICY "Administrators can insert reservas"
    ON public.reservas FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.common_areas ca
            JOIN public.condominiums c ON ca.condo_id = c.id
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE ca.id = reservas.common_area_id
            AND a.tenant_id = auth.uid()
        )
    );

-- Política para administradores atualizarem reservas
CREATE POLICY "Administrators can update reservas"
    ON public.reservas FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.common_areas ca
            JOIN public.condominiums c ON ca.condo_id = c.id
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE ca.id = reservas.common_area_id
            AND a.tenant_id = auth.uid()
        )
    );

-- Política para administradores deletarem reservas
CREATE POLICY "Administrators can delete reservas"
    ON public.reservas FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.common_areas ca
            JOIN public.condominiums c ON ca.condo_id = c.id
            JOIN public.administrators a ON c.administrator_id = a.id
            WHERE ca.id = reservas.common_area_id
            AND a.tenant_id = auth.uid()
        )
    );

-- Política para moradores verem suas próprias reservas
CREATE POLICY "Residents can view own reservas"
    ON public.reservas FOR SELECT
    USING (
        resident_id IN (
            SELECT id FROM public.residents WHERE user_id = auth.uid()
        )
    );

-- Política para moradores criarem suas próprias reservas
CREATE POLICY "Residents can insert own reservas"
    ON public.reservas FOR INSERT
    WITH CHECK (
        resident_id IN (
            SELECT id FROM public.residents WHERE user_id = auth.uid()
        )
    );
