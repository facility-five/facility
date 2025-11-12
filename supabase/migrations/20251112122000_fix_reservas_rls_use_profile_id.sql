-- Ajustar políticas RLS de reservas para usar residents.profile_id
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- Remover políticas anteriores baseadas em residents.user_id
DROP POLICY IF EXISTS "Residents can view own reservas" ON public.reservas;
DROP POLICY IF EXISTS "Residents can insert own reservas" ON public.reservas;
DROP POLICY IF EXISTS "Residents can update own reservas" ON public.reservas;
DROP POLICY IF EXISTS "Residents can delete own reservas" ON public.reservas;

-- Moradores: SELECT próprias reservas
CREATE POLICY "Residents can view own reservas"
  ON public.reservas FOR SELECT TO authenticated
  USING (
    resident_id IN (
      SELECT r.id FROM public.residents r WHERE r.profile_id = auth.uid()
    )
  );

-- Moradores: INSERT próprias reservas
CREATE POLICY "Residents can insert own reservas"
  ON public.reservas FOR INSERT TO authenticated
  WITH CHECK (
    resident_id IN (
      SELECT r.id FROM public.residents r WHERE r.profile_id = auth.uid()
    )
  );

-- Moradores: UPDATE próprias reservas
CREATE POLICY "Residents can update own reservas"
  ON public.reservas FOR UPDATE TO authenticated
  USING (
    resident_id IN (
      SELECT r.id FROM public.residents r WHERE r.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    resident_id IN (
      SELECT r.id FROM public.residents r WHERE r.profile_id = auth.uid()
    )
  );

-- Moradores: DELETE próprias reservas
CREATE POLICY "Residents can delete own reservas"
  ON public.reservas FOR DELETE TO authenticated
  USING (
    resident_id IN (
      SELECT r.id FROM public.residents r WHERE r.profile_id = auth.uid()
    )
  );
