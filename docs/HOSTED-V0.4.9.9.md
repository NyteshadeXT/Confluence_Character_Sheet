# v0.4.9.9 — Friendly Power Rank Progression

System Data Studio Powers now provide dedicated Iron Rank 3, 6, and 9 progression cards.

Each milestone supports a Name, player-facing Description, and multiple mechanical
effects. Common effects can be built without JSON: damage dice/formula changes, Power
attack bonuses, damage type, range, targets, Hit/Miss/Effect riders, costs, and custom
text. Advanced Power JSON remains available for unusual mechanics.

The builder writes the existing `rank_expressions.Iron` model, so no database migration
is required. Resolved player Powers consume these operations cumulatively.
