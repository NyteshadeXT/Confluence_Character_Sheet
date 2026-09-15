# v0.4.12.0 RPC Contract Reconciliation

Canonical contract is `neon/03_neon_application_functions.sql`. The validation branch is evidence for compile testing only and is not the deployment source of truth.

| RPC | Frontend arguments | Canonical | Validation branch | Status |
|---|---|---|---|---|
| get_my_home | none | `()` | `()` | canonical updated in v0.4.12.0 |
| gm_get_catalog | `p_campaign_id` | `(uuid)` | `(uuid)` | signature exact; canonical response expanded |
| get_character_snapshot | `p_character_id` | `(uuid)` | `(uuid)` | exact |
| gm_get_campaign_roster | `p_campaign_id` | `(uuid)` | `(uuid)` | exact |
| gm_add_player_by_email | `p_campaign_id,p_email` | `(uuid,text)` | `(uuid,text)` | exact |
| gm_assign_character_owner | `p_character_id,p_user_id` | `(uuid,uuid)` | `(uuid,uuid)` plus email overload | canonical call exact |
| gm_unassign_character_owner | `p_character_id` | `(uuid)` | absent | canonical only |
| gm_create_character | `p_campaign_id,p_name,p_ancestry,p_attributes` | `(uuid,text,text,jsonb)` | `(uuid,text,text)` | validation probe mismatch |
| player_create_character | `p_campaign_id,p_name,p_ancestry,p_attributes` | `(uuid,text,text,jsonb)` | `(uuid,text,text)` | validation probe mismatch |
| gm_delete_character | `p_character_id` | `(uuid)` | absent | destructive; canonical only |
| gm_assign_essence | `p_character_id,p_essence_id` | `(uuid,text)` | `(uuid,text,integer)` | validation probe mismatch |
| gm_remove_essence | `p_character_id,p_essence_id` | `(uuid,text)` | absent | destructive; canonical only |
| gm_assign_power | `p_character_id,p_essence_id,p_power_id` | `(uuid,text,text)` | `(uuid,uuid,text,integer)` | validation probe mismatch |
| gm_remove_power | `p_character_power_id` | `(uuid)` | absent | destructive; canonical only |
| gm_grant_xp | `p_character_id,p_amount,p_note` | `(uuid,integer,text)` | same | exact |
| player_update_profile_state | `p_character_id,p_training,p_equipment,p_loadout,p_essence_choices` | same names/types | validation uses `p_training_json,p_equipment_json,p_loadout_json,p_essence_choices_json` | validation argument-name mismatch |
| player_update_runtime | `p_character_id,p_state` | `(uuid,jsonb)` | same | exact |
| player_rank_power | `p_character_power_id` | `(uuid)` | same | exact |
| player_rank_skill | `p_character_id,p_skill_name` | `(uuid,text)` | same | exact |
| is_system_gm | none | security foundation `()` | `()` | exact |
| gm_upsert_ancestry_definition | five named args | canonical five args | same | exact |
| gm_upsert_condition_definition | five named args | canonical five args | same | exact |
| gm_upsert_essence_definition | five named args | canonical five args | same | exact |
| gm_upsert_power_definition | six named args incl. `p_eligible_essence_ids` | canonical six args | five args, eligibility missing | validation probe mismatch |
| gm_delete_power_definition | `p_power_id` | `(text)` | absent | destructive; canonical only |

The frontend and canonical SQL are the pair intended for eventual production deployment.
