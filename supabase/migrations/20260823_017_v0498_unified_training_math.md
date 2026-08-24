# v0.4.9.8

No PostgreSQL schema migration is required.

The existing protected `player_rank_skill(character_id, training_name)` operation
already supports any trained entry in `training_json`, so Armor, Shield, and Saving
Throw ranks can use the same XP advancement mechanism without schema changes.
