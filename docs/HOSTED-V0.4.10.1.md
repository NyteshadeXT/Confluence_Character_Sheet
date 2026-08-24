# Hosted Connected Prototype v0.4.10.1 — Rank Mutation Resolver Fix

Fixes a v0.4.10.0 resolver bug where `modify_named_effect` and
`enhance_named_effect` were saved and shown under Applied Rank Effects but were not
dispatched by the cumulative Power resolver.

Existing Powers do not need to be removed, re-added, or recreated.

Example:
Lance of Faith Rank 6 `Expose | +2 | +3` now changes the visible Expose rider from
+2 to +3 for an existing Rank 6 character.
