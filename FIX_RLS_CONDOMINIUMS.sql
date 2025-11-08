-- Execute este SQL no Supabase SQL Editor
-- Para corrigir o RLS de condominiums

-- Drop existing policies
DROP POLICY IF EXISTS "Usuários podem ver condomínios de suas administradoras" ON public.condominiums;
DROP POLICY IF EXISTS "Usuários podem criar condomínios em suas administradoras" ON public.condominiums;
DROP POLICY IF EXISTS "Usuários podem atualizar condomínios de suas administradoras" ON public.condominiums;
DROP POLICY IF EXISTS "Usuários podem deletar condomínios de suas administradoras" ON public.condominiums;

-- Create new policies that work with user_id and responsible_id
CREATE POLICY "Users can view condominiums from their administrators"
    ON public.condominiums FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.administrators
            WHERE administrators.id = condominiums.administrator_id
            AND (administrators.user_id = auth.uid() OR administrators.responsible_id = auth.uid())
        )
    );

CREATE POLICY "Users can create condominiums in their administrators"
    ON public.condominiums FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.administrators
            WHERE administrators.id = condominiums.administrator_id
            AND (administrators.user_id = auth.uid() OR administrators.responsible_id = auth.uid())
        )
    );

CREATE POLICY "Users can update condominiums from their administrators"
    ON public.condominiums FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.administrators
            WHERE administrators.id = condominiums.administrator_id
            AND (administrators.user_id = auth.uid() OR administrators.responsible_id = auth.uid())
        )
    );

CREATE POLICY "Users can delete condominiums from their administrators"
    ON public.condominiums FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.administrators
            WHERE administrators.id = condominiums.administrator_id
            AND (administrators.user_id = auth.uid() OR administrators.responsible_id = auth.uid())
        )
    );
