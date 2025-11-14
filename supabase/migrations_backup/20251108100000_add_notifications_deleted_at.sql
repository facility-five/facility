-- Add soft-delete column to notifications
alter table if exists public.notifications
  add column if not exists deleted_at timestamptz;

-- Index to make queries excluding deleted items faster
create index if not exists notifications_deleted_at_idx on public.notifications(deleted_at);

-- Note: RLS policies already allow owners to update their notifications (with check user_id = auth.uid()).
-- This migration is intentionally idempotent and safe to run on production.
