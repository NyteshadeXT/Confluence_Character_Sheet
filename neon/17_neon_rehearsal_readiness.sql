-- 17_neon_rehearsal_readiness.sql
-- READ ONLY. Execute on a dedicated migration rehearsal branch, never as a substitute
-- for row-by-row source reconciliation. No credentials or personal emails are output.
-- Expected before import: auth_users=6, mapped_profiles=6, missing_profile_auth=0.
-- Expected after import: all missing_auth counts = 0 and operational counts match
-- the contemporaneous Supabase export (not the synthetic RPC validation branch).
select 'auth_users' as check_name, count(*)::bigint as observed from neon_auth."user"
union all select 'mapped_profiles',count(*) from public.profiles p join neon_auth."user" u on u.id=p.user_id
union all select 'missing_profile_auth',count(*) from public.profiles p left join neon_auth."user" u on u.id=p.user_id where u.id is null
union all select 'missing_campaign_creator_auth',count(*) from public.campaigns c left join neon_auth."user" u on u.id=c.created_by where u.id is null
union all select 'missing_campaign_member_auth',count(*) from public.campaign_members cm left join neon_auth."user" u on u.id=cm.user_id where u.id is null
union all select 'missing_character_owner_auth',count(*) from public.character_users cu left join neon_auth."user" u on u.id=cu.user_id where u.id is null
union all select 'missing_essence_assigner_auth',count(*) from public.character_essences ce left join neon_auth."user" u on u.id=ce.assigned_by where ce.assigned_by is not null and u.id is null
union all select 'missing_power_assigner_auth',count(*) from public.character_powers cp left join neon_auth."user" u on u.id=cp.assigned_by where cp.assigned_by is not null and u.id is null
union all select 'missing_xp_actor_auth',count(*) from public.character_xp_ledger xl left join neon_auth."user" u on u.id=xl.actor_user_id where xl.actor_user_id is not null and u.id is null
order by check_name;
