-- Live v0.4.11.0 authoritative function captured from production.
-- Supabase auth.uid() is intentionally retained here for later Neon Auth adaptation.
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
 values(p.character_id,-cost,'POWER_RANK_PURCHASE','Power advancement to '||p.tier||' '||p.rank||': '||p.power_id,auth.uid());
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
