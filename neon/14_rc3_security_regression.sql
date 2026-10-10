-- Read-only. Run after applying canonical schema on Neon validation.
-- All rows should return true. This does NOT replace authenticated API testing.
select 'no_player_character_update_policy' as check_name,
 not exists(select 1 from pg_policies where schemaname='public' and tablename='characters' and policyname='characters_player_update') as passed
union all
select 'single_gm_table',to_regclass('public.confluence_gm') is not null
union all
select 'gm_role_function_security_definer',exists(select 1 from pg_proc where oid='public.is_system_gm()'::regprocedure and prosecdef)
union all
select 'skill_rank_function_security_definer',exists(select 1 from pg_proc where oid='public.player_rank_skill(uuid,text)'::regprocedure and prosecdef)
union all
select 'skill_rank_not_anonymous',not has_function_privilege('anonymous','public.player_rank_skill(uuid,text)','EXECUTE')
union all
select 'skill_rank_authenticated',has_function_privilege('authenticated','public.player_rank_skill(uuid,text)','EXECUTE')
union all
select 'xp_cost_bronze_rank2',public.confluence_skill_xp_cost('Bronze',2)=20;
