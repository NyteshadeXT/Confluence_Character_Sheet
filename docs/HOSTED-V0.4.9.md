# Hosted Connected Prototype v0.4.9 — Essence Progression

## Essence System Data
The Essence editor now models an Essence as a progression tree rather than assignment metadata. It includes Core Concept, progression philosophy, tiered HP/Healing Surge/Stamina/Mana rules, structured training grants and choices, structured mastery milestones, and a derived Eligible Powers list.

## Machine-readable progression
Resource rules are stored in `tier_progression[].resource_rules`. Mastery effects are stored in `tier_progression[].milestones[].effects`. Training interactions are stored as `grant_training` / `grant_training_choice` effects in `other_unlocks`. The character sheet consumes these records directly.

## Player visibility
Milestone schedules remain GM/system data and are not exposed as future milestones on the Player sheet. Once earned, their mechanical effects are included in derived calculations and summarized only as current Essence benefits.

## Blade migration
The live Blade Essence is the first fully migrated definition. It now matches the supplied reference for Iron/Bronze resource progression, Rank 6 Light Blade/Heavy Blade training choice, and Rank 3/5/9 mastery effects.

No database schema change is required because `essence_definitions.definition` is already JSONB.
