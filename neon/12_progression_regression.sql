-- Confluence v0.4.12.10: read-only validation checks
-- Run on Neon validation branch only. Does not modify data.
select 'gm_singleton' as check_name, count(*)=1 as passed from public.confluence_gm
union all
select 'test_character_exists', count(*)=1 from public.characters where id='22222222-2222-4222-8222-222222222222'::uuid
union all
select 'test_character_owner', count(*)=1 from public.character_users where character_id='22222222-2222-4222-8222-222222222222'::uuid and user_id='a0ccce77-101f-4c7e-aab9-8cbacfdb7ce1'::uuid and access_role='OWNER'
union all
select 'xp_iron_2', public.confluence_skill_xp_cost('Iron',2)=10
union all
select 'xp_bronze_2', public.confluence_skill_xp_cost('Bronze',2)=20
union all
select 'xp_silver_10', public.confluence_skill_xp_cost('Silver',10)=300
union all
select 'xp_gold_10', public.confluence_skill_xp_cost('Gold',10)=400
union all
select 'xp_invalid_rank', public.confluence_skill_xp_cost('Bronze',1) is null
union all
select 'anonymous_rank_denied', not has_function_privilege('anonymous','public.player_rank_skill(uuid,text)','EXECUTE')
union all
select 'authenticated_rank_allowed', has_function_privilege('authenticated','public.player_rank_skill(uuid,text)','EXECUTE')
union all
select 'anonymous_helper_denied', not has_function_privilege('anonymous','public.confluence_skill_xp_cost(text,integer)','EXECUTE')
union all
select 'anonymous_home_denied', not has_function_privilege('anonymous','public.get_my_home()','EXECUTE')
union all
select 'authenticated_home_allowed', has_function_privilege('authenticated','public.get_my_home()','EXECUTE');
