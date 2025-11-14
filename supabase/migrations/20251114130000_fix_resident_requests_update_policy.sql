-- Fix resident_requests RLS policies to ensure updates work properly
-- Drop existing policies first to avoid conflicts

DROP POLICY IF EXISTS "Administrators can view condo requests" ON public.resident_requests;
DROP POLICY IF EXISTS "Administrators can update condo requests" ON public.resident_requests;

-- Recreate policies with correct permissions
CREATE POLICY "Administrators can view condo requests"
  ON public.resident_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.condominiums c
      JOIN public.administrators a ON c.administrator_id = a.id
      WHERE c.id = resident_requests.condominium_id
        AND (a.user_id = auth.uid() OR a.responsible_id = auth.uid())
    )
  );

CREATE POLICY "Administrators can update condo requests"
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

-- Ensure RLS is enabled
ALTER TABLE public.resident_requests ENABLE ROW LEVEL SECURITY;