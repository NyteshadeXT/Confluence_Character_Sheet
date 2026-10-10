# Hosted v0.4.11.4 — Provider-Neutral API Foundation

This release begins the frontend half of the Supabase → Neon migration without changing the active production provider.

## Added

- `confluence-api.js`: provider-neutral RPC/Data API facade.
- `confluence-auth.js`: provider-neutral session/auth facade.
- `neon-config.js`: non-secret Neon validation-branch Auth/Data API endpoints and provider switch.
- `docs/RPC-INVENTORY-V0.4.11.4.md`: reconciled frontend RPC inventory.

## RPC reconciliation

The hosted frontend references 21 distinct RPC names. All 21 are represented by the Neon SQL layer (`02_neon_identity_and_security.sql` + `03_neon_application_functions.sql`).

## Provider switch

`window.CONFLUENCE_BACKEND_PROVIDER` remains `supabase` by default. This deliberately keeps the current deployed application behavior unchanged while the Neon browser Auth bootstrap and end-to-end JWT/RLS tests are completed.

The new API facade already contains a Neon PostgREST-compatible RPC path (`POST /rpc/<function>`) and authenticated request plumbing. Neon Auth JWT acquisition is intentionally left behind a `CONFLUENCE_NEON_AUTH_CLIENT` bootstrap boundary so the static application does not read or manipulate Auth cookies directly.

## Next

1. Bootstrap `@neondatabase/neon-js` / Neon Auth in the browser build.
2. Migrate page code from direct `confluenceSupabase.rpc/from` calls to `confluenceApi` methods.
3. Exercise a real Neon Auth session against the validation branch Data API and RLS.
4. Complete remaining destructive/removal RPC validation through a controlled deployment path.
5. Import production data and perform parity testing before provider cutover.
