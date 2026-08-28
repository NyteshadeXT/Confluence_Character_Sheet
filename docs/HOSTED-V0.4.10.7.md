# v0.4.10.7 — GM Power Deletion

System Data Studio now provides a red **Delete Power** action for an existing saved
Power.

Deletion is protected by the GM-only `gm_delete_power_definition(text)` RPC and requires
an explicit browser confirmation.

A deletion removes:
- the master `power_definitions` record;
- all `essence_power_eligibility` links;
- all `character_powers` assignments using that Power;
- matching values from `characters.loadout_json`;
- matching character-power UUID entries from Daily expended state.

The RPC returns counts of removed eligibility links and character assignments so the
Studio can report the result.

Power ID editing/renaming is intentionally not included.
