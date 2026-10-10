-- 07_neon_data_migration_preflight.sql
-- READ ONLY. Run on the Neon target before importing Supabase application data.
-- It reports which source identities have a Neon Auth account available for UUID remapping.
-- Source inventory captured 2026-09-15 from the live Supabase profiles table.

with source_profiles(source_user_id, email, display_name) as (
  values
    ('8c21c67c-515a-42f5-920f-c7b4c9b95a8e'::uuid, 'agoema@gmail.com', 'agoema'),
    ('ef95f6c9-9cd9-4b4e-9987-7f3e73e5863f'::uuid, 'athengar@gmail.com', 'athengar'),
    ('6abae000-d118-48fa-959c-a10cfca5f444'::uuid, 'kevinrau11@yahoo.com', 'kevinrau11'),
    ('8b3b67be-a729-458b-a353-7708c0ebc66b'::uuid, 'kkroening@outlook.com', 'kkroening'),
    ('8de0c4ea-f718-4a4b-b658-f916e58a5092'::uuid, 'kroening0601@gmail.com', 'kroening0601'),
    ('b001c741-a569-45f5-b373-7d31edd12057'::uuid, 'smet.jody@gmail.com', 'smet.jody')
), matched as (
  select s.source_user_id,
         s.email,
         s.display_name,
         u.id as neon_user_id,
         case when u.id is null then 'NEON AUTH SIGNUP REQUIRED' else 'READY' end as status
  from source_profiles s
  left join neon_auth."user" u on lower(u.email) = lower(s.email)
)
select * from matched order by email;
