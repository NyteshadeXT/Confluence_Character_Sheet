# Hosted Connected Prototype v0.4.9.5 — Weapon Skill Advancement & Compact Player UI

## Weapon Skills

Weapon groups now use the same Rank advancement system as character Skills.

- Untrained = Rank 0.
- Training grants Rank 1.
- Rank 1 -> 2 costs 10 XP.
- Rank 2 -> 3 costs 15 XP.
- Rank 3 -> 4 costs 20 XP.
- Rank 4 -> 5 costs 25 XP.
- Rank 5 -> 6 costs 35 XP.
- Rank 6 -> 7 costs 45 XP.
- Rank 7 -> 8 costs 60 XP.
- Rank 8 -> 9 costs 75 XP.
- Rank 9 -> 10 costs 100 XP.

The same tier caps apply: Iron 10, Bronze 20, Silver 30, Gold 40, Platinum+ uncapped.
The existing protected backend advancement operation is generalized to Training entries,
so Skills and Weapon Skills both deduct XP and update the ledger atomically.

Armor, Shields, and Saving Throws remain proficiency-only.

## Compact Player UI

The desktop character sheet has a higher-density presentation:
- smaller header, panels, controls, resource cards, Attributes, and Defenses;
- Rest & Recovery collapses when it is not needed;
- tabs use less vertical space and remain visible while scrolling;
- Skills and Weapon Skills are displayed side-by-side on wide screens;
- Armor/Shields and Saving Throws share a compact secondary row;
- Training rows show Name, total Skill score where applicable, proficiency, Rank, and
  Rank-Up cost without a large card per entry;
- Owned Power Essence groups default to collapsed so the Power tab can be scanned quickly;
- card padding, section gaps, tables, equipment details, and Essence slots are tightened.

The responsive layout falls back to one-column Training groups on narrower screens.
