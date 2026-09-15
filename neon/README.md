# Neon Schema Package — v0.4.11.3

This directory is the clean Neon-target schema built from the canonical live Supabase snapshot.

Apply in order only after Neon Auth is enabled:

1. `00_neon_preflight.sql`
2. `01_neon_schema.sql`
3. `02_neon_identity_and_security.sql`
4. `03_neon_application_functions.sql`
5. `04_neon_auth_profile_bootstrap.sql`

## Key adaptation decisions

- Neon Auth is the identity source. Current Neon Auth stores users in `neon_auth.user`.
- The live Neon Auth schema was inspected directly: `neon_auth."user".id` is UUID. Confluence therefore preserves its existing UUID user-reference columns, eliminating an unnecessary identity-type conversion.
- Supabase `auth.uid()` is replaced by the provider-neutral `public.current_user_id()`, which wraps Neon `auth.user_id()`.
- Existing UUIDs for campaigns, characters, owned Essences/Powers and XP ledger rows remain UUIDs.
- PostgreSQL/JSONB/enums/transactions are retained.
- Existing RLS semantics are retained and rewritten against `current_user_id()`.
- No trigger is installed on Neon's managed Auth tables. `ensure_my_profile()` provides an idempotent profile bootstrap after authentication.
- The current hosted RPC surface is recreated for Neon, and the live Bronze breakthrough implementation is included as the authoritative `player_rank_power` definition.
- The legacy email owner-assignment overload is renamed `gm_assign_character_owner_by_email`; the GM UI's ID-based function remains `gm_assign_character_owner(uuid,text)`.

## Not yet performed

This release does **not** apply SQL to Neon, import production data, migrate user accounts, change Vercel environment variables, or switch the frontend away from Supabase.

Before importing application rows, build an old Supabase UUID -> Neon Auth UUID map for the six accounts and rewrite user-reference fields.
