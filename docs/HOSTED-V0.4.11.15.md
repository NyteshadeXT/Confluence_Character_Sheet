# Hosted v0.4.11.15 — Provider Navigation Continuity

This validation release prevents the staged Neon provider selection from being lost during authentication navigation.

## Changes
- Adds a centralized provider-aware URL helper in `confluence-auth.js`.
- `requireSession()` continues to preserve `backend=neon` when redirecting to login.
- `signOutAndRedirect()` now preserves `backend=neon`; it no longer silently falls back to the default Supabase provider.
- `login.html` preserves the active Neon provider when redirecting to its `next` destination after successful sign-in or when an existing session is found.
- Login-page startup session checks now report errors rather than leaving an unhandled rejection.
- Production/default provider remains Supabase unless `backend=neon` is explicitly selected.

## Navigation audit
- `neon-validation.html`: `location.href='/login.html?backend=neon&next=`
- `neon-auth-lifecycle.html`: `location.href='/login.html?backend=neon&next=`
- `confluence-auth.js`: `'/login.html'`
- `confluence-auth.js`: `'/login.html'`
- `supabase-auth.js`: `location.href='/login.html?next=`
- `supabase-auth.js`: `location.href='/login.html`

## Validation
Use the validation preview with `?backend=neon`, sign out through an application page, and verify the resulting login URL still contains `backend=neon`. Sign back in and verify the destination also retains `backend=neon`.

No Neon database, Auth, Data API, RLS, RPC, or production configuration changes are included.
The separate Data API `jwk not found` investigation remains unchanged.
