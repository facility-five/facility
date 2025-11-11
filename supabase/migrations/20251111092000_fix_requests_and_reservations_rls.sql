-- RLS para reservations e requests alinhadas a moradores e administradores

-- Reservations
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas se existirem
DROP POLICY IF EXISTS "Residents can view own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Residents can create own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Residents can update own reservations" ON public.reservations;

DROP POLICY IF EXISTS "Administrators can view all reservations" ON public.reservations;

-- Moradores: SELECT/INSERT/UPDATE/DELETE somente das próprias reservas
CREATE POLICY "Residents can select own reservations"
  ON public.reservations FOR SELECT TO authenticated
  USING (
    resident_id IN (
      SELECT r.id FROM public.residents r WHERE r.user_id = auth.uid()
    )
  );

CREATE POLICY "Residents can insert own reservations"
  ON public.reservations FOR INSERT TO authenticated
  WITH CHECK (
    resident_id IN (
      SELECT r.id FROM public.residents r WHERE r.user_id = auth.uid()
    )
  );

CREATE POLICY "Residents can update own reservations"
  ON public.reservations FOR UPDATE TO authenticated
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

CREATE POLICY "Residents can delete own reservations"
  ON public.reservations FOR DELETE TO authenticated
  USING (
    resident_id IN (
      SELECT r.id FROM public.residents r WHERE r.user_id = auth.uid()
    )
  );

-- Administradores: visualizar e gerenciar reservas das áreas comuns dos condomínios que administram
CREATE POLICY "Administrators can manage condo reservations"
  ON public.reservations FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.common_areas ca
      JOIN public.condominiums c ON ca.condominium_id = c.id
      JOIN public.administrators a ON c.administrator_id = a.id
      WHERE ca.id = public.reservations.common_area_id
        AND a.tenant_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.common_areas ca
      JOIN public.condominiums c ON ca.condominium_id = c.id
      JOIN public.administrators a ON c.administrator_id = a.id
      WHERE ca.id = public.reservations.common_area_id
        AND a.tenant_id = auth.uid()
    )
  );

-- Requests
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas se existirem
DROP POLICY IF EXISTS "Residents can view own requests" ON public.requests;
DROP POLICY IF EXISTS "Administrators can view all requests" ON public.requests;

-- Moradores: SELECT/INSERT/UPDATE/DELETE somente das próprias solicitações
CREATE POLICY "Residents can select own requests"
  ON public.requests FOR SELECT TO authenticated
  USING (
    resident_id IN (
      SELECT r.id FROM public.residents r WHERE r.user_id = auth.uid()
    )
  );

CREATE POLICY "Residents can insert own requests"
  ON public.requests FOR INSERT TO authenticated
  WITH CHECK (
    resident_id IN (
      SELECT r.id FROM public.residents r WHERE r.user_id = auth.uid()
    )
  );

CREATE POLICY "Residents can update own requests"
  ON public.requests FOR UPDATE TO authenticated
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

CREATE POLICY "Residents can delete own requests"
  ON public.requests FOR DELETE TO authenticated
  USING (
    resident_id IN (
      SELECT r.id FROM public.residents r WHERE r.user_id = auth.uid()
    )
  );

-- Administradores: visualizar e gerenciar solicitações das administradoras que gerenciam
CREATE POLICY "Administrators can manage own admin requests"
  ON public.requests FOR ALL TO authenticated
  USING (
    administrator_id IN (
      SELECT a.id FROM public.administrators a WHERE a.tenant_id = auth.uid()
    )
  )
  WITH CHECK (
    administrator_id IN (
      SELECT a.id FROM public.administrators a WHERE a.tenant_id = auth.uid()
    )
  );