# Hosted Connected Prototype v0.4.9.2 — Combat Cards & Power Formatting

## Combat Mode Power Cards

Table Combat Cards now have three interaction levels:

1. Collapsed — default scanning view.
2. Expanded — click/tap the card to resolve the Power in place.
3. Full Power — `View Full Power` opens a modal containing the complete Power card.

Only one Table Combat Card is expanded at a time. There is no hover-dependent behavior.

Collapsed cards show identity, Action/Range/Target when available, and final attack
modifier/defense. Expanded cards show keywords, attack math, Attack/Hit/Miss/Effect/
Special/Sustain, current Rank effects, resource status, and Use Power controls.

## Formatted Power Text

Power text fields now support lightweight formatting:
- blank line → paragraph
- `**bold**`
- `*italic*`
- backticks → inline code/dice notation
- `- item` or `• item` → bullet list

Named bold riders such as `**Expose**` are automatically separated into a new paragraph
when embedded in a longer line. Formatting applies to normal Owned Powers, expanded
Combat Cards, and the Full Power modal.

## Essence Milestone Attack Effects

Adds two generalized effect types:

`power_attack_keyword | Implement | 1`
- +1 to attack rolls with Powers carrying the Implement keyword.

`round_attack | 1 | 1`
- +1 to all attack rolls during combat Round 1.

Round attack bonuses apply to both Power and weapon attacks while combat is active.

## Essence Library Power Coverage

Essence cards in System Data Studio now display per-slot Power coverage:
`S1:n · S2:n · S3:n · S4:n · S5:n`

Cards are labeled `Full Suite` when all five slots have at least one eligible Power,
or `Incomplete` with the missing slot numbers.
