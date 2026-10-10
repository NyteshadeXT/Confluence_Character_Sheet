-- Execute on validation after the intended GM has a Neon Auth account.
-- Replace the placeholder UUID; do not commit an actual user ID.
insert into public.confluence_gm(singleton,user_id)
values(true,'REPLACE_WITH_GM_AUTH_UUID'::uuid)
on conflict(singleton) do update set user_id=excluded.user_id;
notify pgrst,'reload schema';
