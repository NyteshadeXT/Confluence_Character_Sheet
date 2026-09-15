-- 04_neon_auth_profile_bootstrap.sql
create or replace function public.ensure_my_profile()
returns public.profiles
language plpgsql security definer set search_path=public,neon_auth
as $$
declare r public.profiles; uid uuid; u record;
begin
 uid:=public.current_user_id();
 if uid is null then raise exception 'Authentication required'; end if;
 select id,email,name into u from neon_auth."user" where id=uid;
 if u.id is null then raise exception 'Neon Auth user not found'; end if;
 insert into public.profiles(user_id,display_name,email)
 values(uid,coalesce(nullif(u.name,''),split_part(u.email,'@',1)),u.email)
 on conflict(user_id) do update set email=excluded.email,
   display_name=coalesce(public.profiles.display_name,excluded.display_name),updated_at=now()
 returning * into r;
 return r;
end $$;
