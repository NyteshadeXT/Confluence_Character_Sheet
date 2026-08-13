# Hosted Connected Prototype v0.4.7 — Character Usability & GM Assignment Controls

## Character Training
- AC removed from Training.
- Fortitude, Reflex, and Will moved into a `Saving Throws` group.
- Saving Throws use proficiency only and have no Rating.
- Armor and Saving Throws no longer display `No Rating`.
- Training proficiency dropdowns are widened and no longer truncate labels.

## Ancestry Powers
The Character Sheet can now display Ancestry Powers stored in the active Ancestry
definition's `powers` array. The System Data Studio exposes an `Ancestry Powers (JSON)`
field for this data.

Current live ancestry definitions did not contain ancestry-power data at the time this
release was built, so their actual powers still need to be entered; the display path is
now restored.

## Equipment
Equipped item cards use a stronger green-tinted background, border, left accent, and
badge.

`Repair 5 Durability` restores 5 durability HP to armor/shields, capped at Max HP.
The current prototype does not charge materials, time, or another repair resource.

## GM Campaign Dashboard
- Assigned Essences can be removed.
- Removing an Essence also removes Powers attached to that Essence.
- Assigned Powers can be removed individually.
- The Assign Power Essence selector is sticky and preserves the last selected Essence
  after assignment/refresh while it remains valid.
