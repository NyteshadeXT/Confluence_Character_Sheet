# v0.4.10.6.2 — GM Training Reset

Adds a GM-only Training correction tool to Campaign Management.

- Select a character.
- Select one of that character's Training entries.
- Reset it to Untrained / Rank 0.
- XP is not refunded.
- The operation is protected by a SECURITY DEFINER RPC that verifies the caller is a GM
  of the character's campaign. Players cannot use the operation.

This release includes and applies `gm_reset_character_training(uuid,text)` to Supabase.
