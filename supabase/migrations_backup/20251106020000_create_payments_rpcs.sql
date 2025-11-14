-- Create RPC functions to fetch payments with profile info
-- Includes admin-aware filtering and SECURITY DEFINER to bypass RLS appropriately

-- get_all_payments_with_profile: returns all payments for Admin do SaaS,
-- otherwise only the caller's own payments
DROP FUNCTION IF EXISTS public.get_all_payments_with_profile();
CREATE OR REPLACE FUNCTION public.get_all_payments_with_profile()
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  plan text,
  amount numeric,
  first_name text,
  last_name text,
  email text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.created_at,
    p.plan,
    p.amount,
    prof.first_name,
    prof.last_name,
    prof.email
  FROM public.payments p
  LEFT JOIN public.profiles prof ON prof.id = p.user_id
  WHERE (
    EXISTS (
      SELECT 1 FROM public.profiles pr
      WHERE pr.id = auth.uid() AND pr.role = 'Admin do SaaS'
    )
  ) OR p.user_id = auth.uid()
  ORDER BY p.created_at DESC;
$$;

-- get_recent_payments_with_profile: returns recent payments with limit,
-- admin sees all, others see only own
DROP FUNCTION IF EXISTS public.get_recent_payments_with_profile(integer);
DROP FUNCTION IF EXISTS public.get_recent_payments_with_profile();
CREATE OR REPLACE FUNCTION public.get_recent_payments_with_profile(limit_count integer)
RETURNS TABLE (
  id uuid,
  created_at timestamptz,
  plan text,
  amount numeric,
  first_name text,
  last_name text,
  email text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.created_at,
    p.plan,
    p.amount,
    prof.first_name,
    prof.last_name,
    prof.email
  FROM public.payments p
  LEFT JOIN public.profiles prof ON prof.id = p.user_id
  WHERE (
    EXISTS (
      SELECT 1 FROM public.profiles pr
      WHERE pr.id = auth.uid() AND pr.role = 'Admin do SaaS'
    )
  ) OR p.user_id = auth.uid()
  ORDER BY p.created_at DESC
  LIMIT COALESCE(limit_count, 4);
$$;