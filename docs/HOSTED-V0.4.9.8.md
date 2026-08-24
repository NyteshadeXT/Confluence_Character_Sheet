# Hosted Connected Prototype v0.4.9.8 — Unified Training & Mastery Mathematics

## Universal Training/Mastery Bonus

Combat-facing ranked components use:

`Training/Mastery Bonus = ceil(relevant Rank / 2)`

Rank 0 = +0
Rank 1–2 = +1
Rank 3–4 = +2
Rank 5–6 = +3
Rank 7–8 = +4
Rank 9–10 = +5

Ordinary Skill checks are unchanged and continue to add the Skill's full numeric Rank.

## Power Attacks

A Power's own Rank contributes only to that Power:

`Character Rank Bonus + Power Rank Attack Bonus + Ability Modifier + other modifiers`

Examples:
- Lance of Faith Rank 5 contributes +3.
- Mindblast Rank 1 contributes +1.

The Math disclosure shows both Power Rank and its resolved attack bonus.

## Weapon Attacks

Weapon Skill Rank no longer adds its full numeric Rank to attacks. It contributes the
half-rate Training Bonus.

`Character Rank Bonus + Ability Modifier + Weapon Training Bonus + Potency + other modifiers`

Weapon Skill Rank still advances through the established Training XP system.

## Armor & Shields

Armor and Shield Training now have numeric Ranks and can be advanced with the same
Training XP system/caps already used by Skills and Weapon Skills.

When equipped and trained:
- Armor item AC remains its Gear contribution.
- Armor Training Rank contributes `ceil(rank / 2)` to AC.
- Shield item AC remains its Gear contribution.
- Shield Training Rank contributes `ceil(rank / 2)` to AC.

Armor and Shield Training bonuses are separate and can both contribute when applicable.

## Saving Throws

Fortitude, Reflex, and Will now have numeric Training Ranks and can be advanced through
the same Training XP mechanism.

Each defense receives its own `ceil(rank / 2)` Training Bonus.

## Hit Points

Maximum HP explicitly starts from `BASE_CHARACTER_HP = 10` and then adds Ancestry,
Ancestry progression, Essence progression, and other permanent modifiers as normal.
