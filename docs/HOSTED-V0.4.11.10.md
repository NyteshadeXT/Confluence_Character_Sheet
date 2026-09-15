# Hosted v0.4.11.10 — Native Neon Better Auth Mapping

This release corrects the Neon authentication implementation against the current official `@neondatabase/neon-js` SDK reference.

## Changes
- Neon bootstrap now uses the SDK's default `BetterAuthVanillaAdapter`.
- Neon password sign-up maps to `auth.signUp.email({ name, email, password })`.
- Neon password sign-in maps to `auth.signIn.email({ email, password })`.
- Session retrieval maps to `auth.getSession()`.
- Sign-out maps to `auth.signOut()`.
- Neon profile updates are limited to the documented `name` and `image` fields.
- Supabase retains its existing native auth calls behind the same facade.
- Neon magic-link behavior is intentionally disabled in the migration facade until separately implemented and validated.

## Validation
The immediate test is password account creation on `/neon-test-account.html?backend=neon`, followed by the read-only `is_system_gm()` RPC on `/neon-validation.html?backend=neon`.

Production/default backend remains Supabase.
