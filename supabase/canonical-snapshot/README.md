# Canonical Supabase Production Snapshot — 2026-09-15

Captured directly from live project `imrfzckchubkfopqjnuf`. This is the migration source of truth
for the Neon transition rather than the historical migration chain.

## Live production inventory
15 public tables, all with RLS enabled:
ancestry_definitions, campaign_members, campaigns, character_attributes, character_essences,
character_powers, character_runtime_state, character_users, character_xp_ledger, characters,
condition_definitions, essence_definitions, essence_power_eligibility, power_definitions, profiles.

Enums:
- campaign_role: GM, PLAYER
- character_access_role: OWNER, VIEWER
- xp_transaction_type: GM_GRANT, GM_ADJUSTMENT, POWER_RANK_PURCHASE, REFUND,
  SYSTEM_ADJUSTMENT, SKILL_RANK_PURCHASE

Auth trigger: `auth.users AFTER INSERT -> public.handle_new_user()`.

Production counts:
profiles 6; campaigns 1; campaign_members 6; characters 5; character_users 5;
character_attributes 5; character_runtime_state 5; character_xp_ledger 64;
ancestry_definitions 8; essence_definitions 24; power_definitions 16;
condition_definitions 7; essence_power_eligibility 32; character_essences 4; character_powers 6.

## Critical live v0.4.11.0 progression
The live `player_rank_power` is authoritative:
- Iron ends at Rank 9.
- all five Powers must be Iron 9 before Bronze 0 breakthrough unlocks.
- Iron 9 -> Bronze 0 costs 150 XP.
- Bronze 1+ is locked until all five Powers are Bronze.
- Bronze 1-9 costs 25, 30, 40, 50, 65, 80, 100, 125, 150 XP.
- Essence tier/rank recalculates transactionally after purchase.

## Neon boundary
Supabase `auth.uid()` and foreign keys to `auth.users` must be adapted to Neon Auth.
Application UUID identity relationships must be mapped before loading user-referencing records.
Supabase passwords, tokens and sessions are intentionally not part of this application snapshot.
