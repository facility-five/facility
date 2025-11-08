create or replace function get_tenant_counts(p_tenant_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_administrators_count int;
  v_condominiums_count int;
  v_blocks_count int;
  v_units_count int;
  v_profiles_count int;
begin
  -- Contar administradoras
  select count(*)
  into v_administrators_count 
  from administrators
  where tenant_id = p_tenant_id
  and deleted_at is null;

  -- Contar condomínios
  select count(*)
  into v_condominiums_count
  from condominiums c
  join administrators a on a.id = c.administrator_id
  where a.tenant_id = p_tenant_id
  and c.deleted_at is null
  and a.deleted_at is null;

  -- Contar blocos
  select count(*)
  into v_blocks_count
  from blocks b
  join condominiums c on c.id = b.condominium_id
  join administrators a on a.id = c.administrator_id
  where a.tenant_id = p_tenant_id
  and b.deleted_at is null
  and c.deleted_at is null
  and a.deleted_at is null;

  -- Contar unidades
  select count(*)
  into v_units_count
  from units u
  join blocks b on b.id = u.block_id
  join condominiums c on c.id = b.condominium_id
  join administrators a on a.id = c.administrator_id
  where a.tenant_id = p_tenant_id
  and u.deleted_at is null
  and b.deleted_at is null
  and c.deleted_at is null
  and a.deleted_at is null;

  -- Contar usuários
  select count(*)
  into v_profiles_count
  from profiles p
  where p.created_by = p_tenant_id
  and p.deleted_at is null;

  return json_build_object(
    'administrators_count', v_administrators_count,
    'condominiums_count', v_condominiums_count,
    'blocks_count', v_blocks_count,
    'units_count', v_units_count,
    'profiles_count', v_profiles_count
  );
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function get_tenant_counts to authenticated;