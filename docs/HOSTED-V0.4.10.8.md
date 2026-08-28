# v0.4.10.8 — Targeted Power Text Mutation

Adds a friendly Rank-Up Effect type:

**Modify Existing Text Value**

Format:
`Section | find text | replacement`

Supported sections include:
- Attack
- Hit
- Miss
- Effect
- Special
- Sustain

The operation replaces only the first matching occurrence in the selected section.
This is useful when the same phrase appears multiple times and only one specific
expression should change.

Cleave Rank 3 example:
`Hit | damage equal to your Essence ability modifier. | damage equal to your Essence ability modifier + 2.`

This changes the secondary Cleave damage while leaving the primary
`1[W] + Essence ability modifier` expression untouched.

No database migration is required.
