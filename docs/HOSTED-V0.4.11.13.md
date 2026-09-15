# Hosted v0.4.11.13 — Pre-Bootstrap JWT Capture

This validation-only release moves the Data API request diagnostic ahead of Neon client construction.

## Changes
- Installs a narrow `window.fetch` diagnostic wrapper after `neon-config.js` but before `neon-bootstrap.js`.
- Allows the Neon client to capture/use the wrapped fetch during construction.
- Observes only requests whose URL begins with the configured Neon Data API URL.
- Reads the Bearer token only in memory and retains only decoded JWT header/claim metadata.
- Never displays, logs, stores, or persists the raw token.
- Compares the outgoing token `kid` with the public Better Auth JWKS key IDs.
- Keeps the existing `is_system_gm()` validation RPC.

## Expected diagnostic outcomes
- `requestObserved: true` and `kidMatch: true`: token and published JWKS agree; persistent `jwk not found` points toward the Data API verifier/integration.
- `requestObserved: true` and `kidMatch: false`: the outgoing token is signed by a different key set.
- `requestObserved: true` with no Bearer token: investigate Neon SDK authentication transport/token injection.
- `requestObserved: false`: the SDK is bypassing the page's global fetch even when wrapped before client construction.

No database, Auth, Data API, RLS, grant, or production configuration changes are included.
Production/default backend remains Supabase.
