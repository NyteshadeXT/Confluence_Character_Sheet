-- 08_neon_data_parity_check.sql
-- READ ONLY. Run after a data import. Expected source counts are the live Supabase snapshot
-- captured on 2026-09-15. Any mismatch must be investigated before cutover.

with expected(table_name, expected_rows) as (
  values
    ('ancestry_definitions', 8::bigint),
    ('campaign_members', 6),
    ('campaigns', 1),
    ('character_attributes', 5),
    ('character_essences', 4),
    ('character_powers', 6),
    ('character_runtime_state', 5),
    ('character_users', 5),
    ('character_xp_ledger', 64),
    ('characters', 5),
    ('condition_definitions', 7),
    ('essence_definitions', 24),
    ('essence_power_eligibility', 32),
    ('power_definitions', 16),
    ('profiles', 6)
), actual(table_name, actual_rows) as (
  select 'ancestry_definitions', count(*) from public.ancestry_definitions union all
  select 'campaign_members', count(*) from public.campaign_members union all
  select 'campaigns', count(*) from public.campaigns union all
  select 'character_attributes', count(*) from public.character_attributes union all
  select 'character_essences', count(*) from public.character_essences union all
  select 'character_powers', count(*) from public.character_powers union all
  select 'character_runtime_state', count(*) from public.character_runtime_state union all
  select 'character_users', count(*) from public.character_users union all
  select 'character_xp_ledger', count(*) from public.character_xp_ledger union all
  select 'characters', count(*) from public.characters union all
  select 'condition_definitions', count(*) from public.condition_definitions union all
  select 'essence_definitions', count(*) from public.essence_definitions union all
  select 'essence_power_eligibility', count(*) from public.essence_power_eligibility union all
  select 'power_definitions', count(*) from public.power_definitions union all
  select 'profiles', count(*) from public.profiles
)
select e.table_name, e.expected_rows, a.actual_rows,
       case when e.expected_rows = a.actual_rows then 'OK' else 'MISMATCH' end as status
from expected e join actual a using (table_name)
order by e.table_name;

-- Referential-integrity checks that should all return zero.
select 'campaign_members.user_id -> neon_auth.user' as check_name, count(*) as orphan_rows
from public.campaign_members cm left join neon_auth."user" u on u.id=cm.user_id where u.id is null
union all
select 'campaigns.created_by -> neon_auth.user', count(*)
from public.campaigns c left join neon_auth."user" u on u.id=c.created_by where u.id is null
union all
select 'character_users.user_id -> neon_auth.user', count(*)
from public.character_users cu left join neon_auth."user" u on u.id=cu.user_id where u.id is null
union all
select 'character_essences.assigned_by -> neon_auth.user', count(*)
from public.character_essences ce left join neon_auth."user" u on u.id=ce.assigned_by where ce.assigned_by is not null and u.id is null
union all
select 'character_powers.assigned_by -> neon_auth.user', count(*)
from public.character_powers cp left join neon_auth."user" u on u.id=cp.assigned_by where cp.assigned_by is not null and u.id is null
union all
select 'character_xp_ledger.actor_user_id -> neon_auth.user', count(*)
from public.character_xp_ledger xl left join neon_auth."user" u on u.id=xl.actor_user_id where xl.actor_user_id is not null and u.id is null;
