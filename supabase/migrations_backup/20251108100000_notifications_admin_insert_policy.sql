-- Migration: Allow Admin do SaaS insert notifications for any user
-- Created: 2025-11-08

-- Ensure RLS remains enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Additional INSERT policy for admins
DROP POLICY IF EXISTS "notifications_admin_insert_any" ON public.notifications;
CREATE POLICY "notifications_admin_insert_any" ON public.notifications
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'Admin do SaaS'
    )
  );

COMMENT ON POLICY "notifications_admin_insert_any" ON public.notifications IS 'Permite que Admin do SaaS crie notificações para qualquer usuário.';