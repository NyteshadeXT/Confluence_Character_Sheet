-- 06_neon_rpc_contract_check.sql
-- READ-ONLY deployment verification. Expected result: zero rows.
-- Any returned row is a missing or mismatched canonical RPC signature.
with expected(proname,identity_args) as (values
 ('create_campaign','text'),
 ('get_my_home',''),
 ('gm_add_player_by_email','uuid, text'),
 ('gm_assign_character_owner','uuid, uuid'),
 ('gm_unassign_character_owner','uuid'),
 ('gm_create_character','uuid, text, text, jsonb'),
 ('player_create_character','uuid, text, text, jsonb'),
 ('gm_delete_character','uuid'),
 ('gm_assign_essence','uuid, text'),
 ('gm_remove_essence','uuid, text'),
 ('gm_assign_power','uuid, text, text'),
 ('gm_remove_power','uuid'),
 ('gm_grant_xp','uuid, integer, text'),
 ('player_update_profile_state','uuid, jsonb, jsonb, jsonb, jsonb'),
 ('player_update_runtime','uuid, jsonb'),
 ('player_rank_skill','uuid, text'),
 ('gm_get_catalog','uuid'),
 ('gm_get_system_catalog',''),
 ('get_active_condition_definitions',''),
 ('gm_get_campaign_roster','uuid'),
 ('get_character_snapshot','uuid'),
 ('gm_upsert_ancestry_definition','text, text, jsonb, boolean'),
 ('gm_upsert_condition_definition','text, text, jsonb, boolean'),
 ('gm_upsert_essence_definition','text, text, text, jsonb, boolean'),
 ('gm_upsert_power_definition','text, text, integer, jsonb, text[], boolean'),
 ('player_rank_power','uuid'),
 ('gm_delete_power_definition','text'),
 ('is_system_gm','')
), actual as (
 select p.proname, pg_get_function_identity_arguments(p.oid) identity_args
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public'
)
select e.proname,e.identity_args as expected_signature,
       coalesce(string_agg(a.identity_args,' | ' order by a.identity_args),'MISSING') as actual_signature
from expected e left join actual a on a.proname=e.proname
group by e.proname,e.identity_args
having not bool_or(coalesce(a.identity_args='','')=e.identity_args)
order by e.proname;
