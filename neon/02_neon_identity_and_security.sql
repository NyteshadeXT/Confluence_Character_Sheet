-- 02_neon_identity_and_security.sql
-- Neon Data API exposes the authenticated JWT subject through auth.user_id().
-- Keep one wrapper so the rest of Confluence is provider-neutral.
create or replace function public.current_user_id() returns uuid
language sql stable as $$ select nullif(auth.user_id(),'')::uuid $$;

create or replace function public.owns_character(target_character uuid) returns boolean
language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.character_users cu
 where cu.character_id=target_character and cu.user_id=public.current_user_id() and cu.access_role='OWNER');
$$;
create or replace function public.is_campaign_gm(target_campaign uuid) returns boolean
language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.campaign_members cm
 where cm.campaign_id=target_campaign and cm.user_id=public.current_user_id() and cm.role='GM');
$$;
create or replace function public.is_system_gm() returns boolean
language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.campaign_members cm
 where cm.user_id=public.current_user_id() and cm.role='GM');
$$;
create or replace function public.can_read_character(target_character uuid) returns boolean
language sql stable security definer set search_path=public as $$
 select public.owns_character(target_character)
 or exists(select 1 from public.characters c where c.id=target_character and public.is_campaign_gm(c.campaign_id));
$$;

alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_members enable row level security;
alter table public.characters enable row level security;
alter table public.character_users enable row level security;
alter table public.character_attributes enable row level security;
alter table public.character_runtime_state enable row level security;
alter table public.character_xp_ledger enable row level security;
alter table public.ancestry_definitions enable row level security;
alter table public.essence_definitions enable row level security;
alter table public.power_definitions enable row level security;
alter table public.condition_definitions enable row level security;
alter table public.essence_power_eligibility enable row level security;
alter table public.character_essences enable row level security;
alter table public.character_powers enable row level security;

create policy profiles_self_read on public.profiles for select using(user_id=public.current_user_id());
create policy profiles_self_update on public.profiles for update using(user_id=public.current_user_id()) with check(user_id=public.current_user_id());
create policy campaigns_create on public.campaigns for insert with check(created_by=public.current_user_id());
create policy campaigns_gm_update on public.campaigns for update using(public.is_campaign_gm(id)) with check(public.is_campaign_gm(id));
create policy campaigns_member_read on public.campaigns for select using(exists(select 1 from public.campaign_members cm where cm.campaign_id=campaigns.id and cm.user_id=public.current_user_id()));
create policy campaign_members_gm_manage on public.campaign_members for all using(public.is_campaign_gm(campaign_id)) with check(public.is_campaign_gm(campaign_id));
create policy campaign_members_member_read on public.campaign_members for select using(user_id=public.current_user_id() or public.is_campaign_gm(campaign_id));
create policy characters_gm_manage on public.characters for all using(public.is_campaign_gm(campaign_id)) with check(public.is_campaign_gm(campaign_id));
create policy characters_player_update on public.characters for update using(public.owns_character(id)) with check(public.owns_character(id));
create policy characters_read on public.characters for select using(public.can_read_character(id));
create policy character_users_gm_manage on public.character_users for all using(exists(select 1 from public.characters c where c.id=character_users.character_id and public.is_campaign_gm(c.campaign_id))) with check(exists(select 1 from public.characters c where c.id=character_users.character_id and public.is_campaign_gm(c.campaign_id)));
create policy character_users_read on public.character_users for select using(user_id=public.current_user_id() or public.can_read_character(character_id));
create policy character_attributes_owner_manage on public.character_attributes for all using(public.owns_character(character_id)) with check(public.owns_character(character_id));
create policy character_attributes_read on public.character_attributes for select using(public.can_read_character(character_id));
create policy runtime_owner_manage on public.character_runtime_state for all using(public.owns_character(character_id)) with check(public.owns_character(character_id));
create policy runtime_read on public.character_runtime_state for select using(public.can_read_character(character_id));
create policy xp_read on public.character_xp_ledger for select using(public.can_read_character(character_id));
create policy character_essences_gm_manage on public.character_essences for all using(exists(select 1 from public.characters c where c.id=character_essences.character_id and public.is_campaign_gm(c.campaign_id))) with check(exists(select 1 from public.characters c where c.id=character_essences.character_id and public.is_campaign_gm(c.campaign_id)));
create policy character_essences_read on public.character_essences for select using(public.can_read_character(character_id));
create policy character_powers_gm_manage on public.character_powers for all using(exists(select 1 from public.characters c where c.id=character_powers.character_id and public.is_campaign_gm(c.campaign_id))) with check(exists(select 1 from public.characters c where c.id=character_powers.character_id and public.is_campaign_gm(c.campaign_id)));
create policy character_powers_read on public.character_powers for select using(public.can_read_character(character_id));
create policy ancestry_defs_read on public.ancestry_definitions for select using(is_active or public.is_system_gm());
create policy condition_definitions_authenticated_read on public.condition_definitions for select using(true);
create policy condition_definitions_system_gm_write on public.condition_definitions for all using(public.is_system_gm()) with check(public.is_system_gm());
create policy essence_defs_gm_read on public.essence_definitions for select using(exists(select 1 from public.campaign_members cm where cm.user_id=public.current_user_id() and cm.role='GM'));
create policy power_defs_gm_read on public.power_definitions for select using(exists(select 1 from public.campaign_members cm where cm.user_id=public.current_user_id() and cm.role='GM'));
create policy eligibility_gm_read on public.essence_power_eligibility for select using(exists(select 1 from public.campaign_members cm where cm.user_id=public.current_user_id() and cm.role='GM'));
