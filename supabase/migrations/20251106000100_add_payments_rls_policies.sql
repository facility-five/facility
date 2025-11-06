-- Enable RLS and add policies so users can see their own payments
-- This fixes the issue where plans do not appear active after payment
-- because the client could not read records from the `payments` table.

-- Enable Row Level Security on payments table
DO $$ BEGIN
  PERFORM 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payments';
  IF FOUND THEN
    ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Allow authenticated users to SELECT only their own payments
DO $$ BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'payments'
  ) THEN
    CREATE POLICY "payments_select_own" ON public.payments
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Optional: allow service role to manage payments (already bypasses RLS)
-- No additional policy needed for inserts via Edge Functions using service key.

-- Note: If a previous policy exists that blocks reads, you may need to drop it.
-- Example:
-- DROP POLICY IF EXISTS "restrict_payments_select" ON public.payments;