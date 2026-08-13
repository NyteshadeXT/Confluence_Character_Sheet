# Hosted Connected Prototype v0.4.8 — System Rules Expansion

## Conditions
Adds a System Data Studio Condition Library with structured modifiers, lifecycle behavior,
derived conditions, overrides, summary/reminder text, and active/inactive state.
Character math consumes configured modifiers. Perception now exposes Conditions in its
math breakdown, so Blinded's -4 is visible rather than merely descriptive.

## Powers
Adds first-class Power authoring fields for Power Type/Concept, Keywords, Description,
Dungeon Resonance, Action Type, Attack Type & Range, Target, Trigger, Requirements,
Attack, Hit, Miss, Effect, Special, and Sustain. Advanced JSON remains available.
Owned Power cards render these fields in the Confluence Power presentation.

## Equipment
Owned Equipment has a confirmed Remove action.
Weapon Group Focus is only shown for multi-group weapons. Single-group weapons such as
Dagger simply use their only group and no longer show a redundant Permanent Focus line.

## Backend
Live Supabase now contains condition_definitions and protected GM upsert support.
