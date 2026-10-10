-- Confluence Character Sheet v0.4.12.3
-- Deterministic Supabase -> Neon application-data import.
-- DO NOT run until all six production users have Neon Auth accounts.
--
-- The operator/agent must first create this temporary table in the same session:
--   create temp table confluence_cutover_payload(payload jsonb) on commit drop;
-- and insert exactly one payload produced by 09_supabase_export_snapshot.sql.
--
-- This script intentionally remaps every Auth-owned UUID by case-insensitive email.
-- Stable application UUIDs (campaigns, characters, essences, powers, ledger rows) are preserved.

begin;

-- Fail closed if the payload is missing or malformed.
do $$
begin
  if (select count(*) from confluence_cutover_payload) <> 1 then
    raise exception 'Expected exactly one confluence_cutover_payload row';
  end if;
  if (select payload->>'format' from confluence_cutover_payload) <> 'confluence-neon-cutover-v1' then
    raise exception 'Unsupported or missing Confluence cutover payload format';
  end if;
end $$;

create temp table confluence_user_map on commit drop as
select
  p.user_id as source_user_id,
  p.email,
  u.id as neon_user_id
from jsonb_to_recordset((select payload->'tables'->'profiles' from confluence_cutover_payload))
  as p(user_id uuid, display_name text, email text, created_at timestamptz, updated_at timestamptz)
left join neon_auth."user" u on lower(u.email) = lower(p.email);

-- Every source identity must resolve exactly once before any application rows are written.
do $$
declare
  missing_count integer;
  duplicate_count integer;
begin
  select count(*) into missing_count from confluence_user_map where neon_user_id is null;
  if missing_count <> 0 then
    raise exception 'Cutover blocked: % source users do not have matching Neon Auth accounts', missing_count;
  end if;

  select count(*) into duplicate_count
  from (select lower(email) from neon_auth."user" group by lower(email) having count(*) > 1) d;
  if duplicate_count <> 0 then
    raise exception 'Cutover blocked: duplicate Neon Auth emails would make UUID mapping ambiguous';
  end if;
end $$;

-- Profiles: Auth UUID changes, profile content does not.
insert into public.profiles(user_id, display_name, email, created_at, updated_at)
select m.neon_user_id, p.display_name, p.email, p.created_at, p.updated_at
from jsonb_to_recordset((select payload->'tables'->'profiles' from confluence_cutover_payload))
  as p(user_id uuid, display_name text, email text, created_at timestamptz, updated_at timestamptz)
join confluence_user_map m on m.source_user_id = p.user_id
on conflict (user_id) do update set
  display_name = excluded.display_name, email = excluded.email,
  created_at = excluded.created_at, updated_at = excluded.updated_at;

-- Catalog/reference data first.
insert into public.ancestry_definitions(id,name,definition,is_active,created_at,updated_at)
select * from jsonb_to_recordset((select payload->'tables'->'ancestry_definitions' from confluence_cutover_payload))
 as x(id text,name text,definition jsonb,is_active boolean,created_at timestamptz,updated_at timestamptz)
on conflict (id) do update set name=excluded.name,definition=excluded.definition,is_active=excluded.is_active,created_at=excluded.created_at,updated_at=excluded.updated_at;

insert into public.condition_definitions(id,name,definition,is_active,created_at,updated_at)
select * from jsonb_to_recordset((select payload->'tables'->'condition_definitions' from confluence_cutover_payload))
 as x(id text,name text,definition jsonb,is_active boolean,created_at timestamptz,updated_at timestamptz)
on conflict (id) do update set name=excluded.name,definition=excluded.definition,is_active=excluded.is_active,created_at=excluded.created_at,updated_at=excluded.updated_at;

insert into public.essence_definitions(id,name,associated_ability,definition,is_active)
select * from jsonb_to_recordset((select payload->'tables'->'essence_definitions' from confluence_cutover_payload))
 as x(id text,name text,associated_ability text,definition jsonb,is_active boolean)
on conflict (id) do update set name=excluded.name,associated_ability=excluded.associated_ability,definition=excluded.definition,is_active=excluded.is_active;

insert into public.power_definitions(id,name,slot_index,definition,is_active)
select * from jsonb_to_recordset((select payload->'tables'->'power_definitions' from confluence_cutover_payload))
 as x(id text,name text,slot_index integer,definition jsonb,is_active boolean)
on conflict (id) do update set name=excluded.name,slot_index=excluded.slot_index,definition=excluded.definition,is_active=excluded.is_active;

insert into public.essence_power_eligibility(essence_id,power_id)
select * from jsonb_to_recordset((select payload->'tables'->'essence_power_eligibility' from confluence_cutover_payload))
 as x(essence_id text,power_id text)
on conflict do nothing;

-- Campaign identity columns are remapped; campaign UUID remains stable.
insert into public.campaigns(id,name,created_by,ruleset_version,created_at,updated_at)
select c.id,c.name,m.neon_user_id,c.ruleset_version,c.created_at,c.updated_at
from jsonb_to_recordset((select payload->'tables'->'campaigns' from confluence_cutover_payload))
 as c(id uuid,name text,created_by uuid,ruleset_version text,created_at timestamptz,updated_at timestamptz)
join confluence_user_map m on m.source_user_id=c.created_by
on conflict (id) do update set name=excluded.name,created_by=excluded.created_by,ruleset_version=excluded.ruleset_version,created_at=excluded.created_at,updated_at=excluded.updated_at;

insert into public.campaign_members(campaign_id,user_id,role,joined_at)
select c.campaign_id,m.neon_user_id,c.role::campaign_role,c.joined_at
from jsonb_to_recordset((select payload->'tables'->'campaign_members' from confluence_cutover_payload))
 as c(campaign_id uuid,user_id uuid,role text,joined_at timestamptz)
join confluence_user_map m on m.source_user_id=c.user_id
on conflict (campaign_id,user_id) do update set role=excluded.role,joined_at=excluded.joined_at;

insert into public.characters(id,campaign_id,name,ancestry_definition_id,available_xp,training_json,equipment_json,loadout_json,essence_choices_json,created_at,updated_at)
select * from jsonb_to_recordset((select payload->'tables'->'characters' from confluence_cutover_payload))
 as x(id uuid,campaign_id uuid,name text,ancestry_definition_id text,available_xp integer,training_json jsonb,equipment_json jsonb,loadout_json jsonb,essence_choices_json jsonb,created_at timestamptz,updated_at timestamptz)
on conflict (id) do update set campaign_id=excluded.campaign_id,name=excluded.name,ancestry_definition_id=excluded.ancestry_definition_id,available_xp=excluded.available_xp,training_json=excluded.training_json,equipment_json=excluded.equipment_json,loadout_json=excluded.loadout_json,essence_choices_json=excluded.essence_choices_json,created_at=excluded.created_at,updated_at=excluded.updated_at;

insert into public.character_users(character_id,user_id,access_role,created_at)
select c.character_id,m.neon_user_id,c.access_role::character_access_role,c.created_at
from jsonb_to_recordset((select payload->'tables'->'character_users' from confluence_cutover_payload))
 as c(character_id uuid,user_id uuid,access_role text,created_at timestamptz)
join confluence_user_map m on m.source_user_id=c.user_id
on conflict (character_id,user_id) do update set access_role=excluded.access_role,created_at=excluded.created_at;

insert into public.character_attributes(character_id,strength,dexterity,constitution,intelligence,wisdom,charisma)
select * from jsonb_to_recordset((select payload->'tables'->'character_attributes' from confluence_cutover_payload))
 as x(character_id uuid,strength integer,dexterity integer,constitution integer,intelligence integer,wisdom integer,charisma integer)
on conflict (character_id) do update set strength=excluded.strength,dexterity=excluded.dexterity,constitution=excluded.constitution,intelligence=excluded.intelligence,wisdom=excluded.wisdom,charisma=excluded.charisma;

insert into public.character_runtime_state(character_id,current_hp,current_mana,current_stamina,current_healing_surges,temporary_hp,barrier,combat_active,round_number,short_rest_recovery_available,loadout_unlocked,conditions_json,modifiers_json,daily_expended_json,updated_at)
select * from jsonb_to_recordset((select payload->'tables'->'character_runtime_state' from confluence_cutover_payload))
 as x(character_id uuid,current_hp integer,current_mana integer,current_stamina integer,current_healing_surges integer,temporary_hp integer,barrier integer,combat_active boolean,round_number integer,short_rest_recovery_available boolean,loadout_unlocked boolean,conditions_json jsonb,modifiers_json jsonb,daily_expended_json jsonb,updated_at timestamptz)
on conflict (character_id) do update set current_hp=excluded.current_hp,current_mana=excluded.current_mana,current_stamina=excluded.current_stamina,current_healing_surges=excluded.current_healing_surges,temporary_hp=excluded.temporary_hp,barrier=excluded.barrier,combat_active=excluded.combat_active,round_number=excluded.round_number,short_rest_recovery_available=excluded.short_rest_recovery_available,loadout_unlocked=excluded.loadout_unlocked,conditions_json=excluded.conditions_json,modifiers_json=excluded.modifiers_json,daily_expended_json=excluded.daily_expended_json,updated_at=excluded.updated_at;

insert into public.character_essences(id,character_id,essence_id,slot_index,current_tier,current_rank,assigned_by,assigned_at)
select e.id,e.character_id,e.essence_id,e.slot_index,e.current_tier,e.current_rank,m.neon_user_id,e.assigned_at
from jsonb_to_recordset((select payload->'tables'->'character_essences' from confluence_cutover_payload))
 as e(id uuid,character_id uuid,essence_id text,slot_index integer,current_tier text,current_rank integer,assigned_by uuid,assigned_at timestamptz)
join confluence_user_map m on m.source_user_id=e.assigned_by
on conflict (id) do update set character_id=excluded.character_id,essence_id=excluded.essence_id,slot_index=excluded.slot_index,current_tier=excluded.current_tier,current_rank=excluded.current_rank,assigned_by=excluded.assigned_by,assigned_at=excluded.assigned_at;

insert into public.character_powers(id,character_id,character_essence_id,power_id,slot_index,tier,rank,assigned_by,assigned_at)
select p.id,p.character_id,p.character_essence_id,p.power_id,p.slot_index,p.tier,p.rank,m.neon_user_id,p.assigned_at
from jsonb_to_recordset((select payload->'tables'->'character_powers' from confluence_cutover_payload))
 as p(id uuid,character_id uuid,character_essence_id uuid,power_id text,slot_index integer,tier text,rank integer,assigned_by uuid,assigned_at timestamptz)
join confluence_user_map m on m.source_user_id=p.assigned_by
on conflict (id) do update set character_id=excluded.character_id,character_essence_id=excluded.character_essence_id,power_id=excluded.power_id,slot_index=excluded.slot_index,tier=excluded.tier,rank=excluded.rank,assigned_by=excluded.assigned_by,assigned_at=excluded.assigned_at;

insert into public.character_xp_ledger(id,character_id,amount,transaction_type,note,actor_user_id,created_at)
select l.id,l.character_id,l.amount,l.transaction_type::xp_transaction_type,l.note,m.neon_user_id,l.created_at
from jsonb_to_recordset((select payload->'tables'->'character_xp_ledger' from confluence_cutover_payload))
 as l(id uuid,character_id uuid,amount integer,transaction_type text,note text,actor_user_id uuid,created_at timestamptz)
join confluence_user_map m on m.source_user_id=l.actor_user_id
on conflict (id) do update set character_id=excluded.character_id,amount=excluded.amount,transaction_type=excluded.transaction_type,note=excluded.note,actor_user_id=excluded.actor_user_id,created_at=excluded.created_at;

-- Final identity assertions inside the transaction.
do $$
begin
  if exists (select 1 from public.profiles p left join neon_auth."user" u on u.id=p.user_id where u.id is null) then
    raise exception 'Cutover blocked: orphaned profiles after import';
  end if;
  if exists (select 1 from public.campaign_members c left join neon_auth."user" u on u.id=c.user_id where u.id is null) then
    raise exception 'Cutover blocked: orphaned campaign membership after import';
  end if;
  if exists (select 1 from public.character_users c left join neon_auth."user" u on u.id=c.user_id where u.id is null) then
    raise exception 'Cutover blocked: orphaned character ownership after import';
  end if;
end $$;

commit;
