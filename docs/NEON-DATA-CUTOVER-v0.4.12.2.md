# Neon Data Cutover Plan — v0.4.12.2

## Purpose

Move the existing Confluence application data from Supabase PostgreSQL to Neon PostgreSQL without changing game IDs, losing history, or incorrectly carrying Supabase Auth UUIDs into Neon Auth foreign keys.

## Verified structural compatibility

On 2026-09-15 the 15 live Supabase application tables and the 15 Neon target tables were compared column-by-column. Their application columns and PostgreSQL types match. The required transformation is therefore primarily **identity remapping**, not data-model translation.

## Live source inventory

| Table | Rows |
|---|---:|
| ancestry_definitions | 8 |
| campaign_members | 6 |
| campaigns | 1 |
| character_attributes | 5 |
| character_essences | 4 |
| character_powers | 6 |
| character_runtime_state | 5 |
| character_users | 5 |
| character_xp_ledger | 64 |
| characters | 5 |
| condition_definitions | 7 |
| essence_definitions | 24 |
| essence_power_eligibility | 32 |
| power_definitions | 16 |
| profiles | 6 |

These counts are a checkpoint, not a permanent assumption. Re-capture them immediately before the final migration because Supabase remains live.

## Identity rule

Supabase Auth and Neon Auth assign different UUIDs to the same human. Never copy a Supabase `user_id` into a Neon Auth foreign key.

Build the mapping by normalized email:

`Supabase profiles.email -> Neon Auth user.email -> Neon Auth user.id`

The following application columns must be remapped:

- `profiles.user_id`
- `campaigns.created_by`
- `campaign_members.user_id`
- `character_users.user_id`
- `character_essences.assigned_by` when non-null
- `character_powers.assigned_by` when non-null
- `character_xp_ledger.actor_user_id` when non-null

All campaign, character, Essence-assignment, Power-assignment, and XP-ledger record UUIDs should otherwise be preserved exactly.

## Current identity readiness

Six Supabase profiles exist. The validation Neon Auth directory currently contains a matching account for `kkroening@outlook.com`; its Neon UUID differs from its Supabase UUID, confirming that remapping is mandatory. The other five production users have not yet been provisioned in this validation Auth directory.

Do not create accounts for the other users merely to make the migration script pass. Before cutover, choose a deliberate account-onboarding approach (user signup/invite/provisioning), then require all six source profiles to resolve uniquely to Neon Auth IDs.

## Cutover sequence

1. Keep Supabase as the live application backend while preparation continues.
2. Resolve the Neon Data API/JWKS platform issue.
3. Deploy and verify the canonical Neon RPC package.
4. Establish all required Neon Auth users.
5. Re-capture source row counts and source data from live Supabase.
6. Generate the email-based old-UUID -> Neon-UUID map and require 6/6 unique matches.
7. Import definition/catalog tables first.
8. Import profiles/campaign ownership and membership using remapped user UUIDs.
9. Import characters and dependent character state while preserving application record UUIDs.
10. Import XP history and assignment audit fields using remapped actor/assigner UUIDs.
11. Run `08_neon_data_parity_check.sql` and require all row counts to match and all orphan counts to be zero.
12. Run `06_neon_rpc_contract_check.sql` and require zero rows.
13. Exercise the real browser acceptance path against Neon.
14. Only after acceptance, change the production frontend provider from Supabase to Neon.
15. Retain Supabase unchanged for a rollback window rather than immediately deleting it.

## Safety gates

Do not cut over if any of these are true:

- any source profile has no unique Neon Auth email match;
- source and target row counts differ without an explained reason;
- any Auth foreign-key orphan exists;
- RPC contract check reports a missing/wrong signature;
- authenticated browser Data API requests still fail;
- core player/GM acceptance tests fail.
