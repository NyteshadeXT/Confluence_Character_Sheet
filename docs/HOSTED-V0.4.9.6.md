# Hosted Connected Prototype v0.4.9.6 — Resolved Power Display

Player-facing Powers now resolve character-specific values instead of requiring the
player to interpret master-data prose.

- `Power Attack vs. Reflex` renders as `Power Attack (+N) vs. Reflex`, using the live
  character attack calculation.
- Essence-dependent damage types resolve from the Power's source Essence. Existing
  mapping prose is hidden once a concrete type is known.
- Rank Expressions stored in the live `rank_expressions` structure are now recognized.
  The older resolver only looked at `tier_progression.rank_expressions`.
- Structured Rank Expression operations can modify visible Power text with
  `replace_text`, `append_text`, and `prepend_text`.
- Applied Rank Expressions are listed in a collapsed `Applied Rank Effects` disclosure
  for transparency, while their mechanical changes appear in the main Power text.
- Training Rank badges display `0`, `1`, `2` rather than `R0`, `R1`, `R2`.

No schema migration is required. Rank Expression data remains inside the existing Power
definition JSON.
