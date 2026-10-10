# Hosted v0.4.11.11 — Auth/Data API JWT Diagnostics

This release narrows the remaining Neon validation failure at the JWT verification boundary.

## Confirmed before this patch
- Managed Better Auth signup succeeds.
- The test user exists in `neon_auth.user`.
- Browser session is authenticated.
- The validation branch Data API is active.
- Neon Auth reports a JWKS endpoint for the same validation branch.
- Data API currently rejects the authenticated RPC with `jwk not found`.

## Changes
- Corrected Better Auth session normalization so the validation session includes the user returned alongside the session.
- Added safe JWT metadata diagnostics to the validation page.
- Diagnostics expose only JWT header/claim metadata such as `alg`, `kid`, `iss`, `aud`, `sub`, `role`, `iat`, and `exp`.
- The raw JWT is never displayed or logged.
- No RLS policies, grants, Auth settings, or Data API security settings are weakened.

## Next validation
Use `/neon-validation.html?backend=neon` while signed in. The metadata will identify whether the browser token's key/issuer matches the branch Auth/Data API integration.

Production/default backend remains Supabase.
