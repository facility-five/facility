-- Create notifications table for in-app alerts in Admin
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  message text not null,
  type text, -- e.g. payment, lead, task, communication, system
  entity_type text, -- optional: payments, leads, tasks, communications
  entity_id text, -- optional: reference id
  severity text check (severity in ('info','success','warning','error')) default 'info',
  is_read boolean default false,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_created_at_idx on public.notifications(created_at);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policies: allow user to read/mark own notifications; allow insert for owner (for seeding/client events)
create policy notifications_select_own
  on public.notifications
  for select
  to authenticated
  using (user_id = auth.uid());

create policy notifications_update_read_own
  on public.notifications
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy notifications_insert_own
  on public.notifications
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Note: consider restricting insert to service role in production and generating notifications via Edge Functions.