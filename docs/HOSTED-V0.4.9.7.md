# Hosted Connected Prototype v0.4.9.7 — Character Rank Mathematics

## Universal Rank Bonus

The character sheet now uses Character Rank Bonus as the universal combat scaling value:

- Iron 0–1: +0
- Iron 2–3: +1
- Iron 4–5: +2
- Iron 6–7: +3
- Iron 8–9: +4
- Iron 10 / Bronze 0–1: +5
- Bronze 2–3: +6
- Bronze 4–5: +7
- Bronze 6–7: +8
- Bronze 8–9: +9
- Bronze 10 / Silver 0–1: +10
- Silver 2–3: +11
- Silver 4–5: +12
- Silver 6–7: +13
- Silver 8–9: +14
- Silver 10: +15

One centralized `characterRankBonus()` function is the source of truth.

Gold and later mathematics are intentionally not extrapolated yet. If encountered before
their progression is formally defined, the implementation preserves +15 rather than
inventing a new progression.

## Attacks

Power Rank no longer automatically contributes to Power attack rolls.

Power attacks now use:
Character Rank Bonus + resolved Ability modifier + applicable Essence/milestone bonuses
+ conditional/round bonuses + active modifiers + conditions.

Weapon attacks now use:
Character Rank Bonus + Ability modifier + Weapon Training Rank + Potency (when an item
definition supplies one) + Essence/milestone bonuses + round/active/condition modifiers.

Power Rank continues to govern individual Power development and Rank Expressions.

## Defenses

Character Rank Bonus is applied exactly once to:
- Armor Class
- Fortitude
- Reflex
- Will

It is not automatically applied to Initiative or Skills.

All defense and attack Math disclosures identify Rank Bonus explicitly.

## Header

The character header now shows the current Rank Bonus beside Character Rank for quick
table reference.
