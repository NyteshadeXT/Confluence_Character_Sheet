# RPC Inventory Reconciliation — v0.4.11.4

## Frontend-required RPCs

A static scan of the hosted HTML/JS finds 21 distinct RPC names:

- get_character_snapshot
- gm_add_player_by_email
- gm_assign_essence
- gm_assign_power
- gm_create_character
- gm_delete_character
- gm_delete_power_definition
- gm_get_campaign_roster
- gm_grant_xp
- gm_remove_essence
- gm_remove_power
- gm_upsert_ancestry_definition
- gm_upsert_condition_definition
- gm_upsert_essence_definition
- gm_upsert_power_definition
- is_system_gm
- player_create_character
- player_rank_power
- player_rank_skill
- player_update_profile_state
- player_update_runtime

## Neon definition coverage

All 21 frontend-required RPC names are represented by the Neon SQL set:

- `is_system_gm` is part of `02_neon_identity_and_security.sql`.
- The other 20 frontend-required RPCs are represented in `03_neon_application_functions.sql`.

The application function file also retains provider/backend helpers not directly referenced by the current frontend:

- create_campaign
- get_my_home
- gm_assign_character_owner (UUID overload)
- gm_assign_character_owner (email overload)
- gm_get_catalog
- gm_unassign_character_owner

These should remain because they are useful backend capabilities and/or support GM workflows even though the current static scan does not directly invoke them.

## Validation status

The Neon validation branch has compile-tested a substantial subset of the RPC layer, including progression, snapshot, runtime/profile persistence, XP, campaign/home, roster/catalog, content-definition upserts, ownership assignment, character creation, and Essence/Power assignment.

Removal/deletion functions remain the least directly testable through the current administrative tool safety boundary. Their source remains in the migration package and should be applied/tested through the final controlled deployment path rather than weakening their behavior.

## Reconciliation result

**Frontend RPC name coverage: 21/21. No missing RPC names.**

This is name/signature-surface reconciliation, not yet authenticated end-to-end validation. Real Neon Auth JWT + Data API testing remains required before cutover.

## Neon Data API role check

The validation database contains `anonymous`, `authenticated`, and `neondb_owner` roles. The existing `GRANT EXECUTE ... TO authenticated` pattern therefore targets a real Neon role and does not need to be removed solely because it originated in the Supabase implementation.
