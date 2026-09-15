# Hosted v0.4.12.5 — RPC Boundary Hardening

## Changed

- Removed the generic browser-facing `from()`, `query()`, and `select()` helpers from `confluence-api.js`.
- The provider-neutral application facade is now RPC-only.
- Added a fail-closed RPC allowlist check: an RPC name must be part of the canonical Confluence browser contract before the facade will dispatch it.
- Updated the facade version/header to reflect the current architecture.

## Why this matters

v0.4.12.4 removed the final direct table reads from application code. This release closes the now-unused escape hatch that could accidentally reintroduce browser table access later. Both Supabase and Neon browser paths therefore use the same explicit RPC boundary for Confluence application data.

This does not remove PostgreSQL tables, RLS, or Data API support. Those remain authoritative backend infrastructure; the change only narrows what application JavaScript can request through the shared facade.

## Backend impact

None. No database DDL, RLS, RPC implementation, Auth configuration, production data, or provider cutover is changed by this release. The Neon `jwk not found` support issue remains with Neon.

## Validation

- All JavaScript files pass `node --check`.
- All inline HTML scripts pass `node --check` after extraction.
- Static scan confirms there are no application calls to `confluenceApi.from()`, `confluenceApi.query()`, or `confluenceApi.select()`.
- Static scan confirms `confluence-api.js` no longer exposes generic table/query helpers.
