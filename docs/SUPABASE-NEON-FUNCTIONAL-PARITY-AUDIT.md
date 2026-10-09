# Supabase → Neon functional parity: character sheet (audit 1)

## Migration principle
The original `main` branch is the functional baseline. The `neon-migration` branch should change transport, identity, authorization, and persistence only where required; game mechanics, Power definitions, and rendering semantics should remain equivalent unless an intentional behavior change is documented.

## Compared directly
- `character/app.js` — original 1,375 lines, Neon 1,438 lines.
- `character/v048.js` — one transport change: active condition lookup moved from Supabase table query to Neon RPC.
- `character/v0494.js` — one transport change: skill ranking RPC.
- `character/v0495.js` — skill ranking RPC plus a defensive null-safe Power name sort.
- `character/v0496.js` — legacy Power-text replacement compatibility edit.
- `character/v04110.js` — comment/version label only.
- `character/index.html` — retains original versioned script chain and adds Neon integration scripts.

## Critical discovery: runtime overrides
`character/index.html` loads `app.js` and then multiple versioned scripts. `v0496.js` reassigns `activeExpressions`, `applyExpressionOperation`, `resolvedPowerModel`, and `powerSections`; it also wraps `resolvedPowerCard`. `v0495.js` overrides `renderPowerLibrary`. Therefore changing the earlier definitions in `app.js` alone does not necessarily affect runtime behavior.

**Rule for future fixes:** Locate the *last runtime assignment* of a function before editing it. Compare that active implementation with `main` before adding compatibility logic.

## Behavior differences to retain intentionally
- Neon API/RPC calls instead of Supabase client calls.
- Defensive null-safe rendering when definitions have not loaded.
- Server-authoritative XP progression and backend reload.
- Single-slot-per-Power loadout constraint and legacy duplicate-assignment visibility.
- Reduced repetitive Long Rest UI text.

## Parity risks requiring tests
1. **Power rank text resolution:** The original `v0496.js` already supports `replace_text`, `replace_text_once`, `append_text`, `prepend_text`, `modify_named_effect`, and `enhance_named_effect`. Verify Cleave at Iron 1/3/6/9 against the original source definition and output. Do not assume all replacements use the same text syntax.
2. **Power progression costs:** The original `app.js` has a flat XP preview, while the Neon backend is authoritative for tiered costs. Verify UI cost, RPC result, XP ledger, and rank display together.
3. **Power render paths:** Test Power Library, expanded Power modal, and compact Combat Mode independently; they use different render paths.
4. **Conditions:** Confirm `get_active_condition_definitions` returns the same active records/order as the original Supabase query.
5. **Character state:** Check that loadout, combat resources, conditions, equipment, Essence choices, and recovery survive a full backend reload.
6. **Content Studio:** Compare original definition validation and write workflows with Neon RPCs, including round-trip JSON preservation.

## Acceptance gate before production
For each behavior, capture original Supabase output and Neon output using the same definition and character state; compare rendered text, numerical calculations, server-side state changes, and authorization. Record deviations as either intentional migration changes or regressions.

## Safety
All testing and writes remain on `neon-migration` and the Neon validation branch. No production cutover is implied by this audit.

## Bulk catalog parity verification (2026-10-09)
Compared source Supabase and Neon validation records across **all fields** in five definition tables, including complete nested JSON and activity flags. The comparison was keyed by original IDs (or Essence/Power composite key), with canonical object-key ordering.

| Table | Source | Neon validation | Source records missing or changed | Validation-only |
|---|---:|---:|---:|---|
| ancestry_definitions | 8 | 8 | 0 | 0 |
| essence_definitions | 24 | 25 | 0 | test-might |
| power_definitions | 16 | 21 | 0 | test-p1 through test-p5 |
| essence_power_eligibility | 32 | 37 | 0 | 5 Test Might mappings |
| condition_definitions | 7 | 7 | 0 | 0 |

Condition definitions were imported verbatim into Neon validation and a repeatable non-destructive SQL migration was committed as `neon/16_original_condition_catalog.sql`.

**Scope:** This proves catalog record parity, not end-to-end behavior or production cutover. Original runtime character/campaign/account records and browser interaction parity remain separate checks. Do not copy Supabase Auth UUIDs directly into Neon identity columns.
