-- MVP validation: use the same direct ownership lookup as get_my_home().
-- Preserve the GM bypass and all snapshot payload fields.
-- Apply after the existing get_character_snapshot(uuid) definition.
DO $do$
DECLARE original text; modified text;
BEGIN
 SELECT pg_get_functiondef('public.get_character_snapshot(uuid)'::regprocedure) INTO original;
 IF position('v_owner:=public.owns_character(p_character_id);' in original)=0 THEN
   RAISE EXCEPTION 'Expected authorization clause not found; review snapshot definition before migrating';
 END IF;
 modified:=replace(original,
   'v_owner:=public.owns_character(p_character_id);',
   'v_owner:=EXISTS (SELECT 1 FROM public.character_users cu WHERE cu.character_id=p_character_id AND cu.user_id=public.current_user_id() AND cu.access_role=''OWNER'');');
 EXECUTE modified;
END $do$;
