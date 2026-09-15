-- 05_neon_rpc_permissions.sql
-- Lock the browser-facing RPC surface to authenticated sessions.
-- SECURITY DEFINER functions still perform their own ownership / GM checks.

revoke execute on function public.create_campaign(text) from public, anonymous;
revoke execute on function public.get_my_home() from public, anonymous;
revoke execute on function public.gm_add_player_by_email(uuid,text) from public, anonymous;
revoke execute on function public.gm_assign_character_owner(uuid,uuid) from public, anonymous;
revoke execute on function public.gm_unassign_character_owner(uuid) from public, anonymous;
revoke execute on function public.gm_create_character(uuid,text,text,jsonb) from public, anonymous;
revoke execute on function public.player_create_character(uuid,text,text,jsonb) from public, anonymous;
revoke execute on function public.gm_delete_character(uuid) from public, anonymous;
revoke execute on function public.gm_assign_essence(uuid,text) from public, anonymous;
revoke execute on function public.gm_remove_essence(uuid,text) from public, anonymous;
revoke execute on function public.gm_assign_power(uuid,text,text) from public, anonymous;
revoke execute on function public.gm_remove_power(uuid) from public, anonymous;
revoke execute on function public.gm_grant_xp(uuid,integer,text) from public, anonymous;
revoke execute on function public.player_update_profile_state(uuid,jsonb,jsonb,jsonb,jsonb) from public, anonymous;
revoke execute on function public.player_update_runtime(uuid,jsonb) from public, anonymous;
revoke execute on function public.player_rank_skill(uuid,text) from public, anonymous;
revoke execute on function public.gm_get_catalog(uuid) from public, anonymous;
revoke execute on function public.gm_get_campaign_roster(uuid) from public, anonymous;
revoke execute on function public.get_character_snapshot(uuid) from public, anonymous;
revoke execute on function public.gm_upsert_ancestry_definition(text,text,jsonb,boolean) from public, anonymous;
revoke execute on function public.gm_upsert_condition_definition(text,text,jsonb,boolean) from public, anonymous;
revoke execute on function public.gm_upsert_essence_definition(text,text,text,jsonb,boolean) from public, anonymous;
revoke execute on function public.gm_upsert_power_definition(text,text,integer,jsonb,text[],boolean) from public, anonymous;
revoke execute on function public.player_rank_power(uuid) from public, anonymous;
revoke execute on function public.gm_delete_power_definition(text) from public, anonymous;
revoke execute on function public.is_system_gm() from public, anonymous;

grant execute on function public.create_campaign(text) to authenticated;
grant execute on function public.get_my_home() to authenticated;
grant execute on function public.gm_add_player_by_email(uuid,text) to authenticated;
grant execute on function public.gm_assign_character_owner(uuid,uuid) to authenticated;
grant execute on function public.gm_unassign_character_owner(uuid) to authenticated;
grant execute on function public.gm_create_character(uuid,text,text,jsonb) to authenticated;
grant execute on function public.player_create_character(uuid,text,text,jsonb) to authenticated;
grant execute on function public.gm_delete_character(uuid) to authenticated;
grant execute on function public.gm_assign_essence(uuid,text) to authenticated;
grant execute on function public.gm_remove_essence(uuid,text) to authenticated;
grant execute on function public.gm_assign_power(uuid,text,text) to authenticated;
grant execute on function public.gm_remove_power(uuid) to authenticated;
grant execute on function public.gm_grant_xp(uuid,integer,text) to authenticated;
grant execute on function public.player_update_profile_state(uuid,jsonb,jsonb,jsonb,jsonb) to authenticated;
grant execute on function public.player_update_runtime(uuid,jsonb) to authenticated;
grant execute on function public.player_rank_skill(uuid,text) to authenticated;
grant execute on function public.gm_get_catalog(uuid) to authenticated;
grant execute on function public.gm_get_campaign_roster(uuid) to authenticated;
grant execute on function public.get_character_snapshot(uuid) to authenticated;
grant execute on function public.gm_upsert_ancestry_definition(text,text,jsonb,boolean) to authenticated;
grant execute on function public.gm_upsert_condition_definition(text,text,jsonb,boolean) to authenticated;
grant execute on function public.gm_upsert_essence_definition(text,text,text,jsonb,boolean) to authenticated;
grant execute on function public.gm_upsert_power_definition(text,text,integer,jsonb,text[],boolean) to authenticated;
grant execute on function public.player_rank_power(uuid) to authenticated;
grant execute on function public.gm_delete_power_definition(text) to authenticated;
grant execute on function public.is_system_gm() to authenticated;
