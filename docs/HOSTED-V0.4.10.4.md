# v0.4.10.4 — Hierarchical Rank Progression

## Power -> Essence

Each Essence always has five contributing Power slots.

- An occupied slot contributes that Power's current tier/rank.
- An empty/undiscovered slot contributes Iron 1.
- Essence Rank is the floor of the five contributors' progress within the lowest
  contributor tier.
- A Power already in a higher tier counts as 10 completed steps relative to a lower tier.
- Essence tier promotion requires all five Powers to cross the tier boundary.

Examples:
- 9, 10, 10, 10, 10 -> Essence remains Iron 9.
- 10, 10, 10, 10, 10 -> Essence becomes Bronze 0.
- 6, 4, empty, empty, empty -> (6+4+1+1+1)/5 = Iron 2.

## Essence -> Character

Character progression uses the same rule with four Essence contributors.

- Four Essences determine Character Rank.
- Tier promotion requires all four Essences to cross the boundary.
- Iron 9 / Bronze 0 / Bronze 0 / Bronze 0 -> Character remains Iron 9.
- Bronze 0 / Bronze 0 / Bronze 0 / Bronze 0 -> Character becomes Bronze 0.
- If fewer than four Essences are assigned, missing Essence positions count as Iron 1.

## Rank 10 normalization

The existing backend still stores the Iron threshold as `Iron 10`.
The player rules now normalize that legacy representation to `Bronze 0` everywhere
hierarchical progression is calculated and in updated Power displays.

Bronze Power advancement beyond Bronze 0 remains intentionally unconfigured.

No database schema migration is required for this release.
