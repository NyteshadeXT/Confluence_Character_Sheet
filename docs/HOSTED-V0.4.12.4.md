# Hosted v0.4.12.4 — RPC-Centric Application Contract

## Changed

- Removed the remaining direct application table reads from Content Studio and the character condition library.
- Added `gm_get_system_catalog()` for system-GM authoring access to ancestry, Essence, Power, eligibility, and condition definitions, including inactive definitions.
- Added `get_active_condition_definitions()` for authenticated character-sheet condition-library reads.
- Added both RPCs to the provider-neutral frontend facade, authenticated-only permission package, and RPC contract check.

## Why this matters

The browser no longer needs to query application tables directly. This gives the Supabase and Neon paths the same explicit RPC-oriented application contract and reduces the surface that must be validated during cutover. Trusted game rules and authorization remain server-side.

## Backend impact

This release prepares new RPC definitions and permissions but does not deploy them to Neon production. Supabase remains the production provider. The existing Neon Data API `jwk not found` support issue is unchanged and no workaround was introduced.

## Validation

- All JavaScript files pass `node --check`.
- All inline HTML scripts pass `node --check` after extraction.
- Static scan confirms no application JavaScript calls `confluenceApi.from(...)`; the provider facade retains generic `.from()` support for compatibility only.
