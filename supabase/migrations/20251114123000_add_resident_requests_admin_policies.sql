-- RLS policies for administrators to manage resident_requests in their condominiums
ALTER TABLE public.resident_requests ENABLE ROW LEVEL SECURITY;

-- Select: administrators (owner or responsible) can see requests for their condos
CREATE POLICY IF NOT EXISTS "Administrators can view condo requests"
  ON public.resident_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.condominiums c
      JOIN public.administrators a ON c.administrator_id = a.id
      WHERE c.id = resident_requests.condominium_id
        AND (a.user_id = auth.uid() OR a.responsible_id = auth.uid())
    )
  );

-- Update: administrators can update requests from their condos
CREATE POLICY IF NOT EXISTS "Administrators can update condo requests"
  ON public.resident_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.condominiums c
      JOIN public.administrators a ON c.administrator_id = a.id
      WHERE c.id = resident_requests.condominium_id
        AND (a.user_id = auth.uid() OR a.responsible_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.condominiums c
      JOIN public.administrators a ON c.administrator_id = a.id
      WHERE c.id = resident_requests.condominium_id
        AND (a.user_id = auth.uid() OR a.responsible_id = auth.uid())
    )
  );