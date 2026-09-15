# Hosted v0.4.11.12 — Outgoing JWT / JWKS Comparison

This validation-only release diagnoses the persistent Neon Data API `jwk not found` response without exposing authentication secrets.

## Changes
- Removes the unsupported `auth.getAccessToken()` diagnostic.
- Temporarily intercepts the validation page's outgoing Data API request through `window.fetch`.
- Extracts the Bearer token only in memory and displays only non-secret JWT header/claim metadata.
- Never displays, logs, stores, or persists the raw JWT.
- Fetches the branch's public Better Auth JWKS document and lists only published key IDs (`kid`).
- Compares the outgoing token `kid` with the JWKS key IDs.
- Restores the original browser `fetch` immediately after the validation RPC.

## Interpretation
- `kidMatch: true` + Data API `jwk not found`: likely Data API/JWKS integration defect or stale verifier state.
- `kidMatch: false`: the SDK is sending a token signed by a different key set.
- No captured Bearer header: investigate how the loaded SDK transports authentication.

No database, RLS, grant, Auth, or Data API configuration is changed by this release.
Production/default backend remains Supabase.
