# Hosted v0.4.12.2 — Data Cutover Readiness

This release prepares the production-data migration without moving or modifying production data.

## Added

- `neon/07_neon_data_migration_preflight.sql` — read-only source-profile to Neon Auth identity readiness report.
- `neon/08_neon_data_parity_check.sql` — read-only expected row-count and Auth-FK orphan verification.
- `docs/NEON-DATA-CUTOVER-v0.4.12.2.md` — explicit migration/cutover/rollback gates.

## Verified live state

- Re-counted all 15 live Supabase application tables.
- Compared all 15 source/target table column names and PostgreSQL types; they match.
- Confirmed Supabase has six profiles.
- Confirmed the validation Neon Auth directory currently has one matching real application email plus the disposable migration test user.
- Confirmed the matching user's Supabase and Neon UUIDs differ, proving identity remapping is required.

## Corrected

Updated the stale header comment in `01_neon_schema.sql` to state correctly that Neon Auth user IDs are UUID.

## Safety

No Supabase or Neon data was changed. No users were created. No production backend was switched. The existing Data API `jwk not found` issue remains an external acceptance blocker, not a reason to weaken RLS or change the identity model.
