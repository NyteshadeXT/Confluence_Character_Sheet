# Neon Deterministic Transfer — v0.4.12.3

This release makes the application-data transfer reproducible instead of relying on ad-hoc copy/paste or preserving Supabase Auth UUIDs.

## Contract

1. Freeze writes to the Supabase application for the cutover window.
2. Run `neon/09_supabase_export_snapshot.sql` against Supabase. It returns one versioned JSONB payload containing all 15 application tables.
3. Ensure every source `profiles.email` has exactly one corresponding Neon Auth user. The import fails closed otherwise.
4. In one Neon SQL session, load the exported payload into a temporary `confluence_cutover_payload(payload jsonb)` table.
5. Run `neon/10_neon_import_snapshot.sql`.
6. Run `neon/08_neon_data_parity_check.sql` and compare counts with the frozen Supabase source.
7. Run `neon/06_neon_rpc_contract_check.sql`.
8. Only after browser Auth → Data API works, execute the real application acceptance path and then change the production frontend provider.

## UUID policy

Application identifiers are preserved: campaign, character, character Essence, character Power, and XP-ledger UUIDs remain unchanged. Auth-owned UUIDs are intentionally replaced. The import derives a mapping from source `profiles.email` to `neon_auth."user".email` and applies the Neon UUID to:

- `profiles.user_id`
- `campaigns.created_by`
- `campaign_members.user_id`
- `character_users.user_id`
- `character_essences.assigned_by`
- `character_powers.assigned_by`
- `character_xp_ledger.actor_user_id`

This is why all production users must exist in Neon Auth before importing application data.

## Safety properties

The import is transactional and validates the payload format before writing. Missing Neon Auth identities or ambiguous duplicate Neon Auth emails abort the transaction. Post-import identity assertions also run before commit.

The scripts are migration artifacts only. v0.4.12.3 does not execute the import and does not modify Supabase or Neon production data.
