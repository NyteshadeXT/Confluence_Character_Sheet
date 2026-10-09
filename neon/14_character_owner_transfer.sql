-- MVP: transfer a character to exactly one campaign player.
-- Apply after the base RPC definitions. Tested first on Neon validation.
CREATE OR REPLACE FUNCTION public.gm_assign_character_owner(p_character_id uuid, p_user_id uuid)
RETURNS public.character_users LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $fn$
DECLARE r public.character_users; v_campaign uuid;
BEGIN
 SELECT campaign_id INTO v_campaign FROM public.characters WHERE id=p_character_id FOR UPDATE;
 IF v_campaign IS NULL OR NOT public.is_campaign_gm(v_campaign) THEN RAISE EXCEPTION 'GM access required'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.campaign_members WHERE campaign_id=v_campaign AND user_id=p_user_id AND role='PLAYER') THEN RAISE EXCEPTION 'Player must belong to this campaign'; END IF;
 DELETE FROM public.character_users WHERE character_id=p_character_id AND access_role='OWNER' AND user_id<>p_user_id;
 INSERT INTO public.character_users(character_id,user_id,access_role) VALUES(p_character_id,p_user_id,'OWNER')
 ON CONFLICT(character_id,user_id) DO UPDATE SET access_role='OWNER' RETURNING * INTO r;
 RETURN r;
END $fn$;

CREATE OR REPLACE FUNCTION public.gm_assign_character_owner(p_character_id uuid, p_email text)
RETURNS public.character_users LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'neon_auth'
AS $fn$
DECLARE uid uuid;
BEGIN
 SELECT u.id INTO uid FROM neon_auth."user" u WHERE lower(u.email)=lower(trim(p_email)) LIMIT 1;
 IF uid IS NULL THEN RAISE EXCEPTION 'User not found'; END IF;
 RETURN public.gm_assign_character_owner(p_character_id,uid);
END $fn$;
