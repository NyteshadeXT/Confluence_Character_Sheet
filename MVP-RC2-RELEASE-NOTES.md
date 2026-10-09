# MVP Release Candidate 2

Based on hosted v0.4.12.7. This is a **candidate**, not a production-approved release.

## Integrated source changes
- Single designated GM table and GM checks in `neon/02_neon_identity_and_security.sql`
- GM read access to all campaigns and GM-only catalog policies
- `get_my_home()` shows all campaigns to the sole GM while preserving player ownership filters
- Tier-specific skill advancement and 150 XP breakthroughs in `neon/03_neon_application_functions.sql`
- Browser RPC permissions in `neon/05_neon_rpc_permissions.sql`
- GM bootstrap template (not automatically applied)
- Read-only regression script

## Validation still required
- Fresh schema application and RPC permission audit
- Authenticated player write tests (skill rank, breakthrough, XP ledger, power advancement)
- Full data migration rehearsal, player account identity mapping and parity checks
- Production cutover approval

No production changes are performed by this archive.

## RC2 authorization fix
- Campaign creation RPC now requires the designated singleton GM.
- Direct campaign INSERT policy also requires the designated singleton GM.
- These source changes are **not yet applied** to the validation database.
