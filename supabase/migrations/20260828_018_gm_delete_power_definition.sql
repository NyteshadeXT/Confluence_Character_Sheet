-- v0.4.10.7 — GM Power Deletion
-- Applied to the live Confluence Character Supabase project.

create or replace function public.gm_delete_power_definition(p_power_id text)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_power_name text;
  v_owned_ids uuid[];
  v_character_count integer := 0;
  v_eligibility_count integer := 0;
begin
  if not public.is_system_gm() then
    raise exception 'GM access required';
  end if;

  select name into v_power_name from public.power_definitions where id=p_power_id;
  if v_power_name is null then raise exception 'Power not found: %',p_power_id; end if;

  select coalesce(array_agg(id),array[]::uuid[]),count(*)
    into v_owned_ids,v_character_count
  from public.character_powers where power_id=p_power_id;

  update public.characters c
  set loadout_json=coalesce((
    select jsonb_object_agg(e.key,e.value)
    from jsonb_each(coalesce(c.loadout_json,'{}'::jsonb)) e
    where trim(both '"' from e.value::text)<>p_power_id
      and trim(both '"' from e.value::text) not like p_power_id||'::%'
  ),'{}'::jsonb),updated_at=now()
  where exists(
    select 1 from jsonb_each(coalesce(c.loadout_json,'{}'::jsonb)) e
    where trim(both '"' from e.value::text)=p_power_id
       or trim(both '"' from e.value::text) like p_power_id||'::%'
  );

  if cardinality(v_owned_ids)>0 then
    update public.character_runtime_state r
    set daily_expended_json=coalesce((
      select jsonb_object_agg(e.key,e.value)
      from jsonb_each(coalesce(r.daily_expended_json,'{}'::jsonb)) e
      where not(e.key=any(select x::text from unnest(v_owned_ids)x))
    ),'{}'::jsonb),updated_at=now()
    where exists(
      select 1 from jsonb_each(coalesce(r.daily_expended_json,'{}'::jsonb)) e
      where e.key=any(select x::text from unnest(v_owned_ids)x)
    );
  end if;

  delete from public.character_powers where power_id=p_power_id;

  select count(*) into v_eligibility_count
  from public.essence_power_eligibility where power_id=p_power_id;
  delete from public.essence_power_eligibility where power_id=p_power_id;

  delete from public.power_definitions where id=p_power_id;

  return jsonb_build_object(
    'deleted',true,
    'power_id',p_power_id,
    'power_name',v_power_name,
    'character_assignments_removed',v_character_count,
    'eligibility_links_removed',v_eligibility_count
  );
end;
$$;

revoke all on function public.gm_delete_power_definition(text) from public;
grant execute on function public.gm_delete_power_definition(text) to authenticated;
