-- Applied live to Supabase.
create or replace function public.gm_reset_character_training(p_character_id uuid, p_training_name text)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
 c public.characters;
 v_training jsonb;
 v_entry jsonb;
begin
 select * into c from public.characters where id=p_character_id for update;
 if c.id is null then raise exception 'Character not found'; end if;
 if not public.is_campaign_gm(c.campaign_id) then raise exception 'GM permission required'; end if;
 v_training:=coalesce(c.training_json,'{}'::jsonb);
 v_entry:=v_training->p_training_name;
 if v_entry is null then raise exception 'Training entry is not available'; end if;
 v_entry:=jsonb_set(v_entry,'{status}',to_jsonb('Untrained'::text),true);
 v_entry:=jsonb_set(v_entry,'{rating}','null'::jsonb,true);
 v_training:=jsonb_set(v_training,array[p_training_name],v_entry,true);
 update public.characters set training_json=v_training,updated_at=now() where id=p_character_id;
 return jsonb_build_object('training',p_training_name,'status','Untrained','rank',0);
end;
$function$;
revoke all on function public.gm_reset_character_training(uuid,text) from public;
grant execute on function public.gm_reset_character_training(uuid,text) to authenticated;
