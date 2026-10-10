# Hosted v0.4.11.14 — Neon Auth Lifecycle Compatibility

This validation release separates the browser Auth lifecycle issue from the existing Data API/JWKS failure.

## Changes
- Normalizes Neon Better Auth `signIn.email()` into the provider-neutral `{ data: { session, user }, error }` contract expected by the existing login page.
- After successful Neon sign-in, performs `getSession()` and returns that authoritative cookie-backed session.
- After Neon sign-out, performs `getSession()` and raises an explicit error if a session remains active.
- Updates the login page to use its existing 15-second auth timeout and report a more accurate session-verification error.
- Corrects the Neon bootstrap comment: response-shape compatibility is handled by `confluence-auth.js`, not NeonJS.
- Adds `neon-auth-lifecycle.html`, a validation-only page for session recheck and sign-out verification.
- The lifecycle page never displays passwords, cookies, session tokens, or JWTs.

## Test sequence
1. Open `/neon-auth-lifecycle.html?backend=neon`.
2. If authenticated, use **Sign Out + Verify**. Expected: `authenticated: false`.
3. Hard-refresh. Expected: still `authenticated: false`.
4. Choose **Go to Login**, sign in with the validation account.
5. Expected: no false "Sign-in did not create a session" message; return to lifecycle page authenticated.
6. Repeat sign-out and hard-refresh.

No Neon database/Auth/Data API/RLS configuration changes are included.
The separate Data API `jwk not found` investigation remains unchanged.
Production/default backend remains Supabase.
