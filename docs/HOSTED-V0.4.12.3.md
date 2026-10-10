# Hosted v0.4.12.3 — Deterministic Data Transfer

## Added

- Versioned, deterministic 15-table Supabase snapshot export.
- Transactional Neon import contract.
- Email-based Supabase Auth UUID → Neon Auth UUID mapping.
- Remapping for every Auth-owned UUID foreign key while preserving stable application UUIDs.
- Fail-closed identity validation before writes and before commit.
- Cutover documentation describing the exact transfer sequence.

## Backend impact

None in this release. The migration scripts were prepared but not executed. Supabase remains live/default and Neon production data is unchanged.
