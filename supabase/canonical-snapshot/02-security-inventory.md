# Live Security Inventory

All 15 public tables have RLS enabled.

Authorization helpers:
- owns_character(uuid)
- is_campaign_gm(uuid)
- can_read_character(uuid)
- is_system_gm()

The live database has policies for campaign membership, character ownership/GM access,
definition visibility, runtime/profile ownership, and system-GM content editing.

Every current policy ultimately depends on Supabase's `auth.uid()` identity and must be translated
to the Neon Auth session identity before cutover.

Security-definer application functions include campaign creation/home, character snapshots,
GM player/owner/Essence/Power/XP/content management, player character creation, Power and Training
rank purchases, profile/runtime updates, and equipment removal.

The live Auth trigger `on_auth_user_created` invokes `public.handle_new_user()`.
