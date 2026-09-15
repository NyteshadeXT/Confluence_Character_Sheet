# Hosted v0.4.12.0 — Neon Integration Candidate

## Goal

Move from migration diagnostics to an application-level Neon integration candidate. Production remains Supabase by default; Neon is still selected explicitly with `?backend=neon`.

## Application changes

- Character Portal now loads its campaign/character bootstrap through `get_my_home()` instead of five separate direct table queries.
- `get_my_home()` now returns `{ campaigns, ancestries }`, including active Ancestry definitions needed for player character creation.
- GM Dashboard now loads campaign access through `get_my_home()` and its assignment catalog through `gm_get_catalog()`.
- `gm_get_catalog()` now includes active Ancestries in addition to Essences, Powers, and eligibility links.
- Provider continuity now applies to application navigation, including Portal → GM Tools, Portal → Character Sheet, GM → Character Sheet, and Character Sheet → Portal.
- The provider-neutral API facade now explicitly inventories `get_my_home`, `gm_get_catalog`, `gm_assign_character_owner`, and `gm_unassign_character_owner`.

## RPC contract reconciliation

The current frontend calls were compared with canonical `neon/03_neon_application_functions.sql` and the live `pg_proc` inventory on `confluence-rpc-validation`. The canonical SQL matches the current frontend argument names. The validation branch still contains several earlier compile probes whose signatures differ from canonical and must not be merged wholesale.

Known validation-branch mismatches include:

- `gm_create_character`: validation probe lacks `p_attributes jsonb`.
- `player_create_character`: validation probe lacks `p_attributes jsonb`.
- `gm_assign_essence`: validation probe has an extra `p_slot_index`.
- `gm_assign_power`: validation probe uses owned-Essence UUID + slot rather than canonical Essence ID.
- `gm_upsert_power_definition`: validation probe lacks `p_eligible_essence_ids text[]`.
- `player_update_profile_state`: validation probe uses `_json` argument names while the frontend/canonical contract uses `p_training`, `p_equipment`, `p_loadout`, `p_essence_choices`.
- destructive/removal functions are absent from validation because they were not applied during compile probing.

## Current external blocker

Authenticated Neon Data API calls still return HTTP 400 `jwk not found` before PostgreSQL execution even though the outgoing EdDSA JWT `kid` matches the live Neon Auth JWKS. This has been escalated to Neon. No RLS weakening, custom JWT verification, or external JWKS workaround is included.

## Production safety

- No production Neon schema/RPC changes were applied in this release.
- No validation-branch database writes were made for this release.
- Supabase remains the default frontend provider.
