# Confluence Connected Prototype v0.3 API

All requests use a prototype identity header:

```http
X-Confluence-User: gm-kyle
```

This is **not production authentication**. It exists to prove permission and character
isolation before Supabase Auth is connected.

## Demo users

- `gm-kyle`
- `player-skarr`
- `player-xavious`

## Read

### Health
`GET /api/health`

### Campaigns visible to user
`GET /api/campaigns`

### Campaign characters
`GET /api/campaigns/{campaign_id}/characters`

GM sees the campaign roster. A Player sees only their own Character.

### Character
`GET /api/characters/{character_id}`

GM may read any Character in the campaign. A Player may read only their own Character.

### Hidden GM catalog
`GET /api/gm/catalog?campaign={campaign_id}`

GM-only. This is where unassigned Essence and Power definitions are exposed for
assignment. Players never receive this endpoint's data.

## GM commands

### Grant / adjust XP
`POST /api/characters/{character_id}/gm/grant-xp`

```json
{"amount": 20, "note": "Dungeon reward"}
```

### Assign Essence
`POST /api/characters/{character_id}/gm/assign-essence`

```json
{"essence_id": "blade"}
```

### Assign Power
`POST /api/characters/{character_id}/gm/assign-power`

```json
{"essence_id": "blade", "power_id": "exacting-strike"}
```

The server validates that the Character owns the Essence, the Power is eligible for it,
and the Essence slot is still empty.

## Player commands

### Rank owned Power
`POST /api/characters/{character_id}/player/rank-power`

```json
{"character_power_id": "char-skarr::might::cleave"}
```

v0.2 performs the XP spend on the server and rejects insufficient XP.

### Runtime patch
`POST /api/characters/{character_id}/player/runtime`

Accepted fields correspond to runtime/session state.

### Player-managed build state
`POST /api/characters/{character_id}/player/profile-state`

Accepted fields:
- `training_json`
- `equipment_json`
- `loadout_json`
- `essence_choices_json`

This endpoint is deliberately coarse in v0.2. The next backend iteration should move
the current prototype's full validation rules into dedicated server commands.


## Full Player UI synchronization

The full `web/character/` client uses the existing endpoints directly.

On initial load:

```text
GET /api/characters/{character_id}
```

Player changes are debounced into:

```text
POST /api/characters/{character_id}/player/runtime
POST /api/characters/{character_id}/player/profile-state
```

Power advancement uses the transactional endpoint instead of generic synchronization:

```text
POST /api/characters/{character_id}/player/rank-power
```

The full Player bundle intentionally does **not** call `/api/gm/catalog`.

## Refresh after GM assignment

v0.3 does not yet use WebSockets/realtime subscriptions. After a GM grants XP or assigns
new hidden content, the Player presses **Reload from Backend** (or reloads the page).
