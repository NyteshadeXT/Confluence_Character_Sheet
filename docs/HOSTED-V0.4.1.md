# Hosted Connected Prototype v0.4.1 — GM Content Studio

## Purpose

Restores GM authoring of hidden shared Confluence system data in the hosted architecture.

The Content Studio is deliberately separate from campaign administration:

- **Campaign Dashboard:** characters, XP, Essence assignment, Power assignment.
- **System Data Studio:** create/edit master Essence and Power definitions.

## Essence authoring

The Studio supports:

- stable Essence ID
- display name
- associated ability
- starting tier
- description
- primary traits
- Associated Scores / threshold JSON
- additional advanced JSON
- active/inactive state

Existing unknown fields are preserved through the Advanced JSON section.

## Power authoring

The Studio supports:

- stable Power ID
- display name
- one of five Power slots
- slot category
- frequency
- multiple eligible Essences
- complete Shared Power Model JSON
- active/inactive state
- duplication as a starting point for a new Power

Eligibility is stored relationally in `essence_power_eligibility` and mirrored into the
Power definition's `eligible_essences` array.

## Security

Master tables are not directly writable by the browser.

Authenticated GMs use security-definer RPCs:

- `gm_upsert_essence_definition`
- `gm_upsert_power_definition`
- `gm_set_definition_active`

Each RPC calls `is_system_gm()` and rejects non-GM users.

Players continue to receive only the Essence/Power definitions attached to their own
character through `get_character_snapshot`.

## Current scope

v0.4.1 authors Essences and Powers only.

Conditions, Equipment definitions, Training definitions, Ancestries, and other shared
master data remain future Content Studio modules.
