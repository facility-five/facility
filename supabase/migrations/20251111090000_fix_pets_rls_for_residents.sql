-- Ajusta RLS de pets para restringir acesso ao ambiente do morador
-- e permitir que administradores gerenciem pets dos condomínios que administram

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Remove políticas amplas anteriores
DROP POLICY IF EXISTS pets_select_authenticated ON public.pets;
DROP POLICY IF EXISTS pets_insert_authenticated ON public.pets;
DROP POLICY IF EXISTS pets_update_authenticated ON public.pets;
DROP POLICY IF EXISTS pets_delete_authenticated ON public.pets;

-- Moradores: visualizar, inserir, atualizar e excluir somente seus próprios pets
CREATE POLICY "Residents can select own pets"
  ON public.pets FOR SELECT TO authenticated
  USING (
    resident_id IN (
      SELECT r.id FROM public.residents r WHERE r.user_id = auth.uid()
    )
  );

CREATE POLICY "Residents can insert own pets"
  ON public.pets FOR INSERT TO authenticated
  WITH CHECK (
    resident_id IN (
      SELECT r.id FROM public.residents r WHERE r.user_id = auth.uid()
    )
  );

CREATE POLICY "Residents can update own pets"
  ON public.pets FOR UPDATE TO authenticated
  USING (
    resident_id IN (
      SELECT r.id FROM public.residents r WHERE r.user_id = auth.uid()
    )
  )
  WITH CHECK (
    resident_id IN (
      SELECT r.id FROM public.residents r WHERE r.user_id = auth.uid()
    )
  );

CREATE POLICY "Residents can delete own pets"
  ON public.pets FOR DELETE TO authenticated
  USING (
    resident_id IN (
      SELECT r.id FROM public.residents r WHERE r.user_id = auth.uid()
    )
  );

-- Administradores: visualizar e gerenciar pets dos condomínios sob sua administração
-- Usa a relação residents -> units -> condominiums -> administrators
CREATE POLICY "Administrators can view managed condos pets"
  ON public.pets FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.residents r
      JOIN public.units u ON r.unit_id = u.id
      JOIN public.condominiums c ON u.condo_id = c.id
      JOIN public.administrators a ON c.administrator_id = a.id
      WHERE r.id = public.pets.resident_id
        AND a.tenant_id = auth.uid()
    )
  );

CREATE POLICY "Administrators can insert managed condos pets"
  ON public.pets FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.residents r
      JOIN public.units u ON r.unit_id = u.id
      JOIN public.condominiums c ON u.condo_id = c.id
      JOIN public.administrators a ON c.administrator_id = a.id
      WHERE r.id = public.pets.resident_id
        AND a.tenant_id = auth.uid()
    )
  );

CREATE POLICY "Administrators can update managed condos pets"
  ON public.pets FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.residents r
      JOIN public.units u ON r.unit_id = u.id
      JOIN public.condominiums c ON u.condo_id = c.id
      JOIN public.administrators a ON c.administrator_id = a.id
      WHERE r.id = public.pets.resident_id
        AND a.tenant_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.residents r
      JOIN public.units u ON r.unit_id = u.id
      JOIN public.condominiums c ON u.condo_id = c.id
      JOIN public.administrators a ON c.administrator_id = a.id
      WHERE r.id = public.pets.resident_id
        AND a.tenant_id = auth.uid()
    )
  );

CREATE POLICY "Administrators can delete managed condos pets"
  ON public.pets FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.residents r
      JOIN public.units u ON r.unit_id = u.id
      JOIN public.condominiums c ON u.condo_id = c.id
      JOIN public.administrators a ON c.administrator_id = a.id
      WHERE r.id = public.pets.resident_id
        AND a.tenant_id = auth.uid()
    )
  );