# Neon Migration Package — v0.4.12.2

This directory is the canonical Neon-target database package for Confluence.

## Deployment order

After Neon Auth is enabled, apply:

1. `00_neon_preflight.sql`
2. `01_neon_schema.sql`
3. `02_neon_identity_and_security.sql`
4. `03_neon_application_functions.sql`
5. `04_neon_auth_profile_bootstrap.sql`
6. `05_neon_rpc_permissions.sql`

Then run `06_neon_rpc_contract_check.sql` as a **read-only verification query**. A correct deployment returns zero rows.

For production-data cutover preparation, run `07_neon_data_migration_preflight.sql` to verify Auth identity readiness. After importing data, run `08_neon_data_parity_check.sql` to verify source row-count parity and zero Auth-FK orphans.

## Canonical application contract

- Neon Auth is the identity source; `neon_auth."user".id` is UUID.
- `public.current_user_id()` bridges the Data API JWT subject from `auth.user_id()` to UUID.
- Application identity references remain UUID.
- PostgreSQL/JSONB/enums/transactions and RLS remain authoritative.
- Trusted advancement, XP, ownership, GM administration, and destructive cleanup remain server-side RPCs.
- Browser-facing RPCs are executable by the `authenticated` role only; individual RPCs additionally enforce ownership/GM authorization as appropriate.
- Canonical owner assignment is `gm_assign_character_owner(uuid,uuid)`.
- Canonical character creation accepts `(campaign UUID, name text, ancestry text, attributes jsonb)`.
- Canonical Essence assignment uses `(character UUID, essence ID text)` and assigns the next slot server-side.
- Canonical Power assignment uses `(character UUID, essence ID text, power ID text)` and derives the Power slot server-side.

## Validation branch warning

`confluence-rpc-validation` contains earlier compile probes with signatures that intentionally differ from this canonical package. Do **not** merge that branch wholesale. Deploy the canonical SQL package instead after approval.

## External blocker

The validation browser path currently receives HTTP 400 `jwk not found` from Neon Data API before PostgreSQL execution, despite the outgoing Neon Auth JWT `kid` matching the live managed JWKS. This has been escalated to Neon. Do not weaken RLS or add custom JWT verification as a workaround.

## Production safety

This package does not itself import production data or switch Vercel away from Supabase. Before cutover, verify the Supabase-to-Neon Auth UUID mapping and migrate application rows using that mapping.
