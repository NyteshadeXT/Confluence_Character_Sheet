# v0.4.10.6 — Essence Training Choice UI Fix

Fixes unresolved training-related Essence milestone choices not appearing on the player sheet.

Behavior:
- Reached Essence milestones with Permanent Choices containing `grant_training` or
  `increase_training` effects now appear at the top of the Training tab.
- The player chooses the option once.
- The selected option id is saved into the existing Essence choice state.
- The resulting training effect is applied immediately.
- Increase Training One Step continues to honor its configured maximum (for example Expert).

Example:
Blade Rank 1/6 Blade Specialization:
- Light Blades
- Heavy Blades

The choice appears as soon as the Blade Essence reaches the configured milestone Rank.

No database migration is required.
