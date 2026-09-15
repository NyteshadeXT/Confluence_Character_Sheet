-- 03_neon_application_functions.sql
-- Complete hosted RPC surface adapted to Neon Auth identity.

create or replace function public.create_campaign(p_name text) returns public.campaigns
language plpgsql security definer set search_path=public as $$
declare c public.campaigns; uid uuid:=public.current_user_id();
begin
 if uid is null then raise exception 'Authentication required'; end if;
 insert into public.campaigns(name,created_by) values(p_name,uid) returning * into c;
 insert into public.campaign_members(campaign_id,user_id,role) values(c.id,uid,'GM');
 return c;
end $$;

create or replace function public.get_my_home() returns jsonb
language plpgsql security definer set search_path=public as $$
declare uid uuid:=public.current_user_id(); v_campaigns jsonb; v_ancestries jsonb;
begin
 if uid is null then raise exception 'Authentication required'; end if;
 select coalesce(jsonb_agg(jsonb_build_object(
   'id',c.id,'name',c.name,'role',cm.role,
   'characters',(select coalesce(jsonb_agg(jsonb_build_object(
      'id',ch.id,'name',ch.name,'ancestry_definition_id',ch.ancestry_definition_id,
      'available_xp',ch.available_xp) order by ch.name),'[]'::jsonb)
     from public.characters ch
     where ch.campaign_id=c.id
       and (cm.role='GM' or exists(select 1 from public.character_users cu where cu.character_id=ch.id and cu.user_id=uid))
   )
 ) order by c.name),'[]'::jsonb)
 into v_campaigns
 from public.campaigns c join public.campaign_members cm on cm.campaign_id=c.id
 where cm.user_id=uid;

 select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'definition',definition) order by name),'[]'::jsonb)
 into v_ancestries from public.ancestry_definitions where is_active;

 return jsonb_build_object('campaigns',coalesce(v_campaigns,'[]'::jsonb),'ancestries',coalesce(v_ancestries,'[]'::jsonb));
end $$;

create or replace function public.gm_add_player_by_email(p_campaign_id uuid,p_email text) returns uuid
language plpgsql security definer set search_path=public,neon_auth as $$
declare target_user uuid;
begin
 if not public.is_campaign_gm(p_campaign_id) then raise exception 'GM access required'; end if;
 select id into target_user from neon_auth."user" where lower(email)=lower(trim(p_email)) limit 1;
 if target_user is null then raise exception 'No authenticated Confluence user exists for that email. Ask the player to sign in once first.'; end if;
 insert into public.profiles(user_id,display_name,email)
 select id,coalesce(nullif(name,''),split_part(email,'@',1)),email from neon_auth."user" where id=target_user
 on conflict(user_id) do update set email=excluded.email,updated_at=now();
 insert into public.campaign_members(campaign_id,user_id,role) values(p_campaign_id,target_user,'PLAYER')
 on conflict(campaign_id,user_id) do update set role='PLAYER';
 return target_user;
end $$;

create or replace function public.gm_assign_character_owner(p_character_id uuid,p_user_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare camp uuid;
begin
 select campaign_id into camp from public.characters where id=p_character_id;
 if camp is null or not public.is_campaign_gm(camp) then raise exception 'GM access required'; end if;
 if not exists(select 1 from public.campaign_members where campaign_id=camp and user_id=p_user_id and role='PLAYER') then raise exception 'Selected user is not a Player in this campaign'; end if;
 delete from public.character_users where character_id=p_character_id and access_role='OWNER';
 insert into public.character_users(character_id,user_id,access_role) values(p_character_id,p_user_id,'OWNER')
 on conflict(character_id,user_id) do update set access_role='OWNER';
end $$;

create or replace function public.gm_unassign_character_owner(p_character_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare camp uuid;
begin select campaign_id into camp from public.characters where id=p_character_id;
 if camp is null or not public.is_campaign_gm(camp) then raise exception 'GM access required'; end if;
 delete from public.character_users where character_id=p_character_id and access_role='OWNER';
end $$;

create or replace function public.gm_create_character(p_campaign_id uuid,p_name text,p_ancestry text,p_attributes jsonb) returns uuid
language plpgsql security definer set search_path=public as $$
declare cid uuid; v_ancestry text; v_def jsonb;
begin
 if not public.is_campaign_gm(p_campaign_id) then raise exception 'GM access required'; end if;
 if coalesce(trim(p_name),'')='' then raise exception 'Character name is required'; end if;
 v_ancestry:=nullif(trim(p_ancestry),''); select definition into v_def from public.ancestry_definitions where id=v_ancestry and is_active;
 if v_def is null then raise exception 'Select a valid active Ancestry'; end if;
 insert into public.characters(campaign_id,name,ancestry_definition_id) values(p_campaign_id,trim(p_name),v_ancestry) returning id into cid;
 insert into public.character_attributes(character_id,strength,dexterity,constitution,intelligence,wisdom,charisma)
 values(cid,coalesce((p_attributes->>'Str')::int,10),coalesce((p_attributes->>'Dex')::int,10),coalesce((p_attributes->>'Con')::int,10),coalesce((p_attributes->>'Int')::int,10),coalesce((p_attributes->>'Wis')::int,10),coalesce((p_attributes->>'Cha')::int,10));
 insert into public.character_runtime_state(character_id,current_hp,current_mana,current_stamina,current_healing_surges)
 values(cid,10+coalesce((v_def->'resources'->>'hp')::int,0),coalesce((v_def->'resources'->>'mana')::int,0),coalesce((v_def->'resources'->>'stamina')::int,0),coalesce((v_def->'resources'->>'surges')::int,0));
 return cid;
end $$;

create or replace function public.player_create_character(p_campaign_id uuid,p_name text,p_ancestry text,p_attributes jsonb) returns uuid
language plpgsql security definer set search_path=public as $$
declare cid uuid; v_name text; v_role public.campaign_role; v_def jsonb; uid uuid:=public.current_user_id();
begin
 if uid is null then raise exception 'Authentication required'; end if;
 select role into v_role from public.campaign_members where campaign_id=p_campaign_id and user_id=uid;
 if v_role is distinct from 'PLAYER' then raise exception 'Player campaign membership required'; end if;
 v_name:=nullif(btrim(p_name),''); if v_name is null then raise exception 'Character name is required'; end if;
 select definition into v_def from public.ancestry_definitions where id=nullif(btrim(p_ancestry),'') and is_active;
 if v_def is null then raise exception 'Select a valid active Ancestry'; end if;
 insert into public.characters(campaign_id,name,ancestry_definition_id) values(p_campaign_id,v_name,p_ancestry) returning id into cid;
 insert into public.character_users values(cid,uid,'OWNER',now());
 insert into public.character_attributes(character_id,strength,dexterity,constitution,intelligence,wisdom,charisma)
 values(cid,coalesce((p_attributes->>'Str')::int,10),coalesce((p_attributes->>'Dex')::int,10),coalesce((p_attributes->>'Con')::int,10),coalesce((p_attributes->>'Int')::int,10),coalesce((p_attributes->>'Wis')::int,10),coalesce((p_attributes->>'Cha')::int,10));
 insert into public.character_runtime_state(character_id,current_hp,current_mana,current_stamina,current_healing_surges)
 values(cid,10+coalesce((v_def->'resources'->>'hp')::int,0),coalesce((v_def->'resources'->>'mana')::int,0),coalesce((v_def->'resources'->>'stamina')::int,0),coalesce((v_def->'resources'->>'surges')::int,0));
 return cid;
end $$;

create or replace function public.gm_delete_character(p_character_id uuid) returns void
language plpgsql security definer set search_path=public as $$
declare camp uuid; begin select campaign_id into camp from public.characters where id=p_character_id;
 if camp is null then raise exception 'Character not found'; end if;
 if not public.is_campaign_gm(camp) then raise exception 'GM access required'; end if;
 delete from public.characters where id=p_character_id; end $$;

create or replace function public.gm_assign_essence(p_character_id uuid,p_essence_id text) returns public.character_essences
language plpgsql security definer set search_path=public as $$
declare c public.characters;r public.character_essences;next_slot integer;
begin select * into c from public.characters where id=p_character_id;
 if c.id is null then raise exception 'Character not found'; end if;
 if not public.is_campaign_gm(c.campaign_id) then raise exception 'GM permission required'; end if;
 if not exists(select 1 from public.essence_definitions where id=p_essence_id and is_active) then raise exception 'Unknown Essence'; end if;
 select * into r from public.character_essences where character_id=p_character_id and essence_id=p_essence_id; if r.id is not null then return r; end if;
 select coalesce(max(slot_index),0)+1 into next_slot from public.character_essences where character_id=p_character_id;
 if next_slot>4 then raise exception 'Character already has four Essences'; end if;
 insert into public.character_essences(character_id,essence_id,slot_index,assigned_by) values(p_character_id,p_essence_id,next_slot,public.current_user_id()) returning * into r; return r;
end $$;

create or replace function public.gm_remove_essence(p_character_id uuid,p_essence_id text) returns boolean
language plpgsql security definer set search_path=public as $$
declare c public.characters;ce public.character_essences;rec record;next_slot integer:=1;
begin select * into c from public.characters where id=p_character_id;
 if c.id is null or not public.is_campaign_gm(c.campaign_id) then raise exception 'GM permission required'; end if;
 select * into ce from public.character_essences where character_id=p_character_id and essence_id=p_essence_id;
 if ce.id is null then raise exception 'Assigned Essence not found'; end if; delete from public.character_essences where id=ce.id;
 for rec in select id from public.character_essences where character_id=p_character_id order by slot_index loop update public.character_essences set slot_index=next_slot where id=rec.id;next_slot:=next_slot+1;end loop; return true;
end $$;

create or replace function public.gm_assign_power(p_character_id uuid,p_essence_id text,p_power_id text) returns public.character_powers
language plpgsql security definer set search_path=public as $$
declare c public.characters;ce public.character_essences;pd public.power_definitions;r public.character_powers;
begin select * into c from public.characters where id=p_character_id;
 if c.id is null or not public.is_campaign_gm(c.campaign_id) then raise exception 'GM permission required'; end if;
 select * into ce from public.character_essences where character_id=p_character_id and essence_id=p_essence_id;if ce.id is null then raise exception 'Character does not own that Essence';end if;
 select * into pd from public.power_definitions where id=p_power_id and is_active;if pd.id is null then raise exception 'Unknown Power';end if;
 if not exists(select 1 from public.essence_power_eligibility where essence_id=p_essence_id and power_id=p_power_id) then raise exception 'Power is not eligible for that Essence';end if;
 if exists(select 1 from public.character_powers where character_essence_id=ce.id and slot_index=pd.slot_index) then raise exception 'That Essence slot already has a Power';end if;
 insert into public.character_powers(character_id,character_essence_id,power_id,slot_index,assigned_by) values(p_character_id,ce.id,p_power_id,pd.slot_index,public.current_user_id()) returning * into r;return r;
end $$;

create or replace function public.gm_remove_power(p_character_power_id uuid) returns boolean
language plpgsql security definer set search_path=public as $$
declare cp public.character_powers;c public.characters;begin select * into cp from public.character_powers where id=p_character_power_id;
 if cp.id is null then raise exception 'Assigned Power not found';end if;select * into c from public.characters where id=cp.character_id;
 if not public.is_campaign_gm(c.campaign_id) then raise exception 'GM permission required';end if;delete from public.character_powers where id=p_character_power_id;return true;end $$;

create or replace function public.gm_grant_xp(p_character_id uuid,p_amount integer,p_note text default null) returns public.characters
language plpgsql security definer set search_path=public as $$
declare c public.characters;begin select * into c from public.characters where id=p_character_id for update;
 if c.id is null or not public.is_campaign_gm(c.campaign_id) then raise exception 'GM permission required';end if;
 if c.available_xp+p_amount<0 then raise exception 'XP cannot be negative';end if;
 update public.characters set available_xp=available_xp+p_amount,updated_at=now() where id=p_character_id returning * into c;
 insert into public.character_xp_ledger(character_id,amount,transaction_type,note,actor_user_id)
 values(p_character_id,p_amount,case when p_amount>=0 then 'GM_GRANT'::public.xp_transaction_type else 'GM_ADJUSTMENT'::public.xp_transaction_type end,p_note,public.current_user_id());return c;end $$;

create or replace function public.player_update_profile_state(p_character_id uuid,p_training jsonb,p_equipment jsonb,p_loadout jsonb,p_essence_choices jsonb) returns public.characters
language plpgsql security definer set search_path=public as $$
declare c public.characters;begin if not public.owns_character(p_character_id) then raise exception 'Character ownership required';end if;
 update public.characters set training_json=coalesce(p_training,training_json),equipment_json=coalesce(p_equipment,equipment_json),loadout_json=coalesce(p_loadout,loadout_json),essence_choices_json=coalesce(p_essence_choices,essence_choices_json),updated_at=now() where id=p_character_id returning * into c;return c;end $$;

create or replace function public.player_update_runtime(p_character_id uuid,p_state jsonb) returns public.character_runtime_state
language plpgsql security definer set search_path=public as $$
declare r public.character_runtime_state;begin if not public.owns_character(p_character_id) then raise exception 'Character ownership required';end if;
 insert into public.character_runtime_state(character_id) values(p_character_id) on conflict(character_id) do nothing;
 update public.character_runtime_state set current_hp=coalesce((p_state->>'current_hp')::int,current_hp),current_mana=coalesce((p_state->>'current_mana')::int,current_mana),current_stamina=coalesce((p_state->>'current_stamina')::int,current_stamina),current_healing_surges=coalesce((p_state->>'current_healing_surges')::int,current_healing_surges),temporary_hp=coalesce((p_state->>'temporary_hp')::int,temporary_hp),barrier=coalesce((p_state->>'barrier')::int,barrier),combat_active=coalesce((p_state->>'combat_active')::boolean,combat_active),round_number=coalesce((p_state->>'round_number')::int,round_number),short_rest_recovery_available=coalesce((p_state->>'short_rest_recovery_available')::boolean,short_rest_recovery_available),loadout_unlocked=coalesce((p_state->>'loadout_unlocked')::boolean,loadout_unlocked),conditions_json=coalesce(p_state->'conditions_json',conditions_json),modifiers_json=coalesce(p_state->'modifiers_json',modifiers_json),daily_expended_json=coalesce(p_state->'daily_expended_json',daily_expended_json),updated_at=now() where character_id=p_character_id returning * into r;return r;end $$;

create or replace function public.player_rank_skill(p_character_id uuid,p_skill_name text) returns jsonb
language plpgsql security definer set search_path=public as $$
declare c public.characters;v_training jsonb;v_entry jsonb;v_status text;v_current int;v_new int;v_cost int;v_tier text;v_cap int;
begin if not public.owns_character(p_character_id) then raise exception 'Character ownership required';end if;select * into c from public.characters where id=p_character_id for update;
 v_training:=coalesce(c.training_json,'{}');v_entry:=v_training->p_skill_name;if v_entry is null then raise exception 'Training entry is not available';end if;
 v_status:=coalesce(v_entry->>'status','Untrained');if v_status='Untrained' then raise exception 'Training is required before spending XP on ranks';end if;
 v_current:=greatest(1,coalesce((v_entry->>'rating')::int,1));v_new:=v_current+1;
 select ce.current_tier into v_tier from public.character_essences ce where ce.character_id=p_character_id order by case ce.current_tier when 'Iron' then 0 when 'Bronze' then 1 when 'Silver' then 2 when 'Gold' then 3 when 'Platinum' then 4 else 5 end limit 1;
 v_tier:=coalesce(v_tier,'Iron');v_cap:=case v_tier when 'Iron' then 10 when 'Bronze' then 20 when 'Silver' then 30 when 'Gold' then 40 else null end;
 if v_cap is not null and v_new>v_cap then raise exception '% Training Rank cap is %',v_tier,v_cap;end if;
 v_cost:=case v_new when 2 then 10 when 3 then 15 when 4 then 20 when 5 then 25 when 6 then 35 when 7 then 45 when 8 then 60 when 9 then 75 when 10 then 100 else null end;
 if v_cost is null then raise exception 'Training XP cost is not configured for Rank % yet',v_new;end if;if c.available_xp<v_cost then raise exception 'Not enough XP. Need % XP',v_cost;end if;
 v_entry:=jsonb_set(v_entry,'{rating}',to_jsonb(v_new),true);v_training:=jsonb_set(v_training,array[p_skill_name],v_entry,true);
 update public.characters set training_json=v_training,available_xp=available_xp-v_cost,updated_at=now() where id=p_character_id;
 insert into public.character_xp_ledger(character_id,amount,transaction_type,note,actor_user_id) values(p_character_id,-v_cost,'SKILL_RANK_PURCHASE','Training advancement: '||p_skill_name||' Rank '||v_new,public.current_user_id());
 return jsonb_build_object('training',p_skill_name,'rank',v_new,'cost',v_cost,'available_xp',c.available_xp-v_cost,'tier',v_tier,'cap',v_cap);end $$;

create or replace function public.gm_get_catalog(p_campaign_id uuid) returns jsonb
language plpgsql security definer set search_path=public as $$
begin if not public.is_campaign_gm(p_campaign_id) then raise exception 'GM authorization required';end if;
 return jsonb_build_object('essences',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'associated_ability',associated_ability) order by name),'[]') from public.essence_definitions where is_active),
 'powers',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'slot',slot_index) order by slot_index,name),'[]') from public.power_definitions where is_active),
 'eligibility',(select coalesce(jsonb_agg(jsonb_build_object('essence_id',essence_id,'power_id',power_id)),'[]') from public.essence_power_eligibility),
 'ancestries',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'definition',definition) order by name),'[]') from public.ancestry_definitions where is_active));end $$;

create or replace function public.gm_get_system_catalog() returns jsonb
language plpgsql security definer set search_path=public as $$
begin
 if not public.is_system_gm() then raise exception 'System GM authorization required';end if;
 return jsonb_build_object(
  'ancestries',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'definition',definition,'is_active',is_active) order by name),'[]') from public.ancestry_definitions),
  'essences',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'associated_ability',associated_ability,'definition',definition,'is_active',is_active) order by name),'[]') from public.essence_definitions),
  'powers',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'slot_index',slot_index,'definition',definition,'is_active',is_active) order by slot_index,name),'[]') from public.power_definitions),
  'eligibility',(select coalesce(jsonb_agg(jsonb_build_object('essence_id',essence_id,'power_id',power_id)),'[]') from public.essence_power_eligibility),
  'conditions',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'definition',definition,'is_active',is_active) order by name),'[]') from public.condition_definitions)
 );
end $$;

create or replace function public.get_active_condition_definitions() returns jsonb
language plpgsql security definer set search_path=public as $$
begin
 if public.current_user_id() is null then raise exception 'Authentication required';end if;
 return coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',name,'definition',definition,'is_active',is_active) order by name) from public.condition_definitions where is_active),'[]'::jsonb);
end $$;

create or replace function public.gm_get_campaign_roster(p_campaign_id uuid) returns jsonb
language plpgsql security definer set search_path=public as $$
declare result jsonb;begin if not public.is_campaign_gm(p_campaign_id) then raise exception 'GM access required';end if;
 select jsonb_build_object('players',coalesce((select jsonb_agg(jsonb_build_object('user_id',cm.user_id,'email',p.email,'display_name',p.display_name,'role',cm.role) order by coalesce(p.display_name,p.email)) from public.campaign_members cm left join public.profiles p on p.user_id=cm.user_id where cm.campaign_id=p_campaign_id and cm.role='PLAYER'),'[]'),
 'characters',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'ancestry_id',c.ancestry_definition_id,'ancestry',coalesce(ad.name,c.ancestry_definition_id,'Unassigned'),'available_xp',c.available_xp,'owner_user_id',cu.user_id,'owner_email',op.email,'owner_display_name',op.display_name) order by c.name) from public.characters c left join public.ancestry_definitions ad on ad.id=c.ancestry_definition_id left join lateral(select character_id,user_id from public.character_users where character_id=c.id and access_role='OWNER' limit 1)cu on true left join public.profiles op on op.user_id=cu.user_id where c.campaign_id=p_campaign_id),'[]')) into result;return result;end $$;

create or replace function public.get_character_snapshot(p_character_id uuid) returns jsonb
language plpgsql security definer set search_path=public as $$
declare result jsonb;v_owner boolean;v_gm boolean;v_campaign uuid;
begin select campaign_id into v_campaign from public.characters where id=p_character_id;if v_campaign is null then raise exception 'Character not found';end if;
 v_owner:=public.owns_character(p_character_id);v_gm:=public.is_campaign_gm(v_campaign);if not(v_owner or v_gm) then raise exception 'Character access required';end if;
 select jsonb_build_object('id',c.id,'campaign_id',c.campaign_id,'name',c.name,'ancestry_id',c.ancestry_definition_id,'ancestry',coalesce(ad.name,c.ancestry_definition_id,'Unassigned'),'ancestry_definition',coalesce(ad.definition,'{}'),'player_user_id',(select cu.user_id from public.character_users cu where cu.character_id=c.id and cu.access_role='OWNER' limit 1),'viewer_is_owner',v_owner,'viewer_is_gm',v_gm,'available_xp',c.available_xp,
 'attributes',jsonb_build_object('Str',coalesce(a.strength,10),'Dex',coalesce(a.dexterity,10),'Con',coalesce(a.constitution,10),'Int',coalesce(a.intelligence,10),'Wis',coalesce(a.wisdom,10),'Cha',coalesce(a.charisma,10)),
 'training',c.training_json,'equipment',c.equipment_json,'loadout',c.loadout_json,'essence_choices',c.essence_choices_json,
 'runtime',jsonb_build_object('hp',coalesce(r.current_hp,10),'mana',coalesce(r.current_mana,0),'stamina',coalesce(r.current_stamina,0),'surges',coalesce(r.current_healing_surges,0),'tempHp',coalesce(r.temporary_hp,0),'barrier',coalesce(r.barrier,0),'combat_active',coalesce(r.combat_active,false),'round',coalesce(r.round_number,1),'short_rest_recovery_available',coalesce(r.short_rest_recovery_available,true),'loadout_unlocked',coalesce(r.loadout_unlocked,false),'conditions',coalesce(r.conditions_json,'[]'),'modifiers',coalesce(r.modifiers_json,'[]'),'daily_expended',coalesce(r.daily_expended_json,'{}')),
 'essences',coalesce((select jsonb_agg(jsonb_build_object('id',ce.essence_id,'name',ed.name,'slot',ce.slot_index,'tier',ce.current_tier,'rank',ce.current_rank,'definition',ed.definition) order by ce.slot_index) from public.character_essences ce join public.essence_definitions ed on ed.id=ce.essence_id where ce.character_id=c.id),'[]'),
 'powers',coalesce((select jsonb_agg(jsonb_build_object('owned_id',cp.id,'power_id',cp.power_id,'name',pd.name,'slot',cp.slot_index,'tier',cp.tier,'rank',cp.rank,'source_essence_id',ce.essence_id,'definition',pd.definition) order by ce.slot_index,cp.slot_index) from public.character_powers cp join public.power_definitions pd on pd.id=cp.power_id join public.character_essences ce on ce.id=cp.character_essence_id where cp.character_id=c.id),'[]'),
 'xp_ledger',coalesce((select jsonb_agg(x order by x.created_at desc) from(select amount,transaction_type::text,note,created_at from public.character_xp_ledger where character_id=c.id order by created_at desc limit 50)x),'[]')) into result
 from public.characters c left join public.ancestry_definitions ad on ad.id=c.ancestry_definition_id left join public.character_attributes a on a.character_id=c.id left join public.character_runtime_state r on r.character_id=c.id where c.id=p_character_id;return result;end $$;

create or replace function public.gm_upsert_ancestry_definition(p_id text,p_name text,p_definition jsonb,p_is_active boolean default true) returns void
language plpgsql security definer set search_path=public as $$
declare v_id text;v_name text;v_definition jsonb;begin if not public.is_system_gm() then raise exception 'GM access required';end if;
 v_id:=trim(both '-' from lower(regexp_replace(trim(p_id),'[^a-zA-Z0-9]+','-','g')));v_name:=nullif(trim(p_name),'');if coalesce(v_id,'')='' or v_name is null then raise exception 'Ancestry ID and name are required';end if;
 v_definition:=coalesce(p_definition,'{}')||jsonb_build_object('id',v_id,'name',v_name);
 insert into public.ancestry_definitions(id,name,definition,is_active,updated_at) values(v_id,v_name,v_definition,coalesce(p_is_active,true),now())
 on conflict(id) do update set name=excluded.name,definition=excluded.definition,is_active=excluded.is_active,updated_at=now();end $$;

create or replace function public.gm_upsert_condition_definition(p_id text,p_name text,p_definition jsonb,p_is_active boolean default true) returns void
language plpgsql security definer set search_path=public as $$
begin if not public.is_system_gm() then raise exception 'GM access required';end if;
 insert into public.condition_definitions(id,name,definition,is_active,updated_at) values(lower(trim(p_id)),trim(p_name),coalesce(p_definition,'{}'),coalesce(p_is_active,true),now())
 on conflict(id) do update set name=excluded.name,definition=excluded.definition,is_active=excluded.is_active,updated_at=now();end $$;

create or replace function public.gm_upsert_essence_definition(p_id text,p_name text,p_associated_ability text,p_definition jsonb,p_is_active boolean default true) returns public.essence_definitions
language plpgsql security definer set search_path=public as $$
declare r public.essence_definitions;begin if not public.is_system_gm() then raise exception 'GM access required';end if;
 insert into public.essence_definitions(id,name,associated_ability,definition,is_active) values(lower(trim(p_id)),trim(p_name),trim(p_associated_ability),coalesce(p_definition,'{}')||jsonb_build_object('id',lower(trim(p_id)),'name',trim(p_name),'associated_ability',trim(p_associated_ability)),coalesce(p_is_active,true))
 on conflict(id) do update set name=excluded.name,associated_ability=excluded.associated_ability,definition=excluded.definition,is_active=excluded.is_active returning * into r;return r;end $$;

create or replace function public.gm_upsert_power_definition(p_id text,p_name text,p_slot_index integer,p_definition jsonb,p_eligible_essence_ids text[],p_is_active boolean default true) returns public.power_definitions
language plpgsql security definer set search_path=public as $$
declare r public.power_definitions;eid text;names jsonb;begin if not public.is_system_gm() then raise exception 'GM access required';end if;
 if p_slot_index not between 1 and 5 then raise exception 'Power slot must be 1 through 5';end if;if coalesce(array_length(p_eligible_essence_ids,1),0)=0 then raise exception 'At least one eligible Essence is required';end if;
 select coalesce(jsonb_agg(e.name order by e.name),'[]') into names from public.essence_definitions e where e.id=any(p_eligible_essence_ids);
 insert into public.power_definitions(id,name,slot_index,definition,is_active) values(lower(trim(p_id)),trim(p_name),p_slot_index,coalesce(p_definition,'{}')||jsonb_build_object('id',lower(trim(p_id)),'name',trim(p_name),'eligible_essences',names),coalesce(p_is_active,true))
 on conflict(id) do update set name=excluded.name,slot_index=excluded.slot_index,definition=excluded.definition,is_active=excluded.is_active returning * into r;
 delete from public.essence_power_eligibility where power_id=r.id;foreach eid in array p_eligible_essence_ids loop insert into public.essence_power_eligibility values(eid,r.id);end loop;return r;end $$;


-- Live v0.4.11.0 authoritative function captured from production.
-- public.current_user_id() is the Neon UUID identity bridge defined in 02_neon_identity_and_security.sql.
CREATE OR REPLACE FUNCTION public.player_rank_power(p_character_power_id uuid)
RETURNS character_powers LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
declare p public.character_powers; c public.characters; e public.character_essences;
cost integer; v_power_count integer; v_ready_count integer; v_bronze_count integer; v_avg_rank integer;
begin
 select * into p from public.character_powers where id=p_character_power_id for update;
 if p.id is null then raise exception 'Power not found'; end if;
 if not public.owns_character(p.character_id) then raise exception 'Character ownership required'; end if;
 select * into c from public.characters where id=p.character_id for update;
 select * into e from public.character_essences where id=p.character_essence_id for update;
 if p.tier='Iron' then
  if p.rank<9 then
   cost:=case p.rank+1 when 2 then 10 when 3 then 15 when 4 then 20 when 5 then 25
    when 6 then 30 when 7 then 35 when 8 then 40 when 9 then 50 else null end;
   if cost is null then raise exception 'Power XP cost is not configured'; end if;
   if c.available_xp<cost then raise exception 'Not enough XP. Need % XP',cost; end if;
   update public.character_powers set rank=rank+1 where id=p.id returning * into p;
  elsif p.rank=9 then
   select count(*),count(*) filter(where (tier='Iron' and rank=9) or tier='Bronze')
   into v_power_count,v_ready_count from public.character_powers where character_essence_id=p.character_essence_id;
   if v_power_count<>5 or v_ready_count<>5 then
    raise exception 'Bronze breakthrough requires all five Powers in this Essence to be Iron 9';
   end if;
   cost:=150;
   if c.available_xp<cost then raise exception 'Not enough XP. Need % XP',cost; end if;
   update public.character_powers set tier='Bronze',rank=0 where id=p.id returning * into p;
  else raise exception 'Iron Power rank is invalid'; end if;
 elsif p.tier='Bronze' then
  select count(*) filter(where tier='Bronze') into v_bronze_count
  from public.character_powers where character_essence_id=p.character_essence_id;
  if v_bronze_count<>5 then raise exception 'Bronze 1+ advancement is locked until all five Powers reach Bronze 0'; end if;
  if p.rank>=9 then raise exception 'Silver breakthrough is not implemented yet'; end if;
  cost:=case p.rank+1 when 1 then 25 when 2 then 30 when 3 then 40 when 4 then 50 when 5 then 65
   when 6 then 80 when 7 then 100 when 8 then 125 when 9 then 150 else null end;
  if cost is null then raise exception 'Bronze Power XP cost is not configured'; end if;
  if c.available_xp<cost then raise exception 'Not enough XP. Need % XP',cost; end if;
  update public.character_powers set rank=rank+1 where id=p.id returning * into p;
 else raise exception 'Power advancement is not configured for tier %',p.tier; end if;
 update public.characters set available_xp=available_xp-cost,updated_at=now() where id=p.character_id;
 insert into public.character_xp_ledger(character_id,amount,transaction_type,note,actor_user_id)
 values(p.character_id,-cost,'POWER_RANK_PURCHASE','Power advancement to '||p.tier||' '||p.rank||': '||p.power_id,public.current_user_id());
 select count(*) filter(where tier='Bronze') into v_bronze_count from public.character_powers where character_essence_id=p.character_essence_id;
 if v_bronze_count=5 then
  select floor(avg(rank))::integer into v_avg_rank from public.character_powers where character_essence_id=p.character_essence_id and tier='Bronze';
  update public.character_essences set current_tier='Bronze',current_rank=coalesce(v_avg_rank,0) where id=p.character_essence_id;
 else
  select floor((coalesce(sum(case when tier='Bronze' then 10 else rank end),0)+greatest(0,5-count(*)))::numeric/5)::integer
  into v_avg_rank from public.character_powers where character_essence_id=p.character_essence_id;
  update public.character_essences set current_tier='Iron',current_rank=least(9,greatest(1,coalesce(v_avg_rank,1))) where id=p.character_essence_id;
 end if;
 return p;
end;$function$;


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
