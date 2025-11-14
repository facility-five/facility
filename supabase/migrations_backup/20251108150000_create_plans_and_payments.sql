-- Enum para o status do pagamento
create type payment_status as enum ('pending', 'active', 'inactive', 'error');

-- Cria a tabela de planos
create table plans (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  name text not null,
  description text,
  price integer not null, -- preço em centavos
  interval text not null, -- 'month' ou 'year'
  max_administrators integer,
  max_condos integer,
  max_blocks integer,
  max_units integer,
  max_users integer,
  
  -- Flags de funcionalidades
  has_sindico boolean not null default false,
  has_porteiro boolean not null default false,
  has_reservas boolean not null default false,
  has_visitantes boolean not null default false,
  has_funcionarios boolean not null default false,
  has_documentos boolean not null default false,
  has_areas_comuns boolean not null default false,
  has_assembleia boolean not null default false,
  has_enquetes boolean not null default false,
  has_classificados boolean not null default false,
  has_ocorrencias boolean not null default false,
  has_chamados boolean not null default false,
  has_pets boolean not null default false,
  has_veiculos boolean not null default false
);

-- Cria a tabela de pagamentos/assinaturas
create table payments (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  user_id uuid references auth.users(id) on delete cascade,
  plan_id uuid references plans(id) on delete restrict,
  
  status payment_status not null default 'pending',
  trial_expires_at timestamptz,
  current_period_starts_at timestamptz,
  current_period_ends_at timestamptz,
  
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,

  error_message text,
  metadata jsonb
);

-- Triggers para updated_at automático
create trigger set_plans_updated_at
  before update on plans
  for each row
  execute procedure moddatetime (updated_at);

create trigger set_payments_updated_at
  before update on payments
  for each row
  execute procedure moddatetime (updated_at);

-- Índices
create index plans_deleted_at_idx on plans (deleted_at) where deleted_at is null;
create index payments_user_id_idx on payments (user_id);
create index payments_status_idx on payments (status);
create index payments_deleted_at_idx on payments (deleted_at) where deleted_at is null;

-- Funções auxiliares
create or replace function get_user_active_plan(p_user_id uuid)
returns uuid
language plpgsql
security definer
as $$
declare
  v_plan_id uuid;
begin
  select plan_id into v_plan_id
  from payments
  where user_id = p_user_id
  and status = 'active'
  and deleted_at is null
  order by created_at desc
  limit 1;

  return v_plan_id;
end;
$$;

-- RLS
alter table plans enable row level security;
alter table payments enable row level security;

-- Políticas de acesso aos planos (todos podem ver)
create policy "Planos são públicos"
  on plans for select
  to authenticated
  using (
    deleted_at is null
  );

-- Políticas de acesso aos pagamentos (apenas o próprio usuário pode ver seus pagamentos)
create policy "Usuários podem ver seus próprios pagamentos"
  on payments for select
  to authenticated
  using (
    auth.uid() = user_id
    and deleted_at is null
  );

-- Grants
grant usage on sequence plans_id_seq to authenticated;
grant usage on sequence payments_id_seq to authenticated;

grant select on table plans to authenticated;
grant select on table payments to authenticated;

grant execute on function get_user_active_plan to authenticated;