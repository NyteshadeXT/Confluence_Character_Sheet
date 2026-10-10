# Hosted v0.4.11.5 — Neon Browser Auth Bootstrap

This release begins executable browser integration with Neon while keeping Supabase as the default provider.

## Added
- `neon-bootstrap.js` loads the official `@neondatabase/neon-js` browser SDK.
- Uses `SupabaseAuthAdapter` so existing sign-in/session method shapes can be retained during staged migration.
- Creates one combined Neon client for Managed Better Auth and Data API.
- `confluence-auth.js` now supports provider-neutral session, user, password sign-in, passwordless sign-in, sign-out, and profile update calls.
- `confluence-api.js` now delegates RPC/table queries to the active provider client; Neon JWT forwarding is owned by neon-js.
- Login page now calls the provider-neutral auth facade.
- Character page now loads the provider-neutral bootstrap/facades.

## Safety / cutover status
- `CONFLUENCE_BACKEND_PROVIDER` still defaults to `supabase`.
- No production Neon data or application RPC deployment is performed by this package.
- Existing Supabase password users cannot have password hashes transferred to Managed Better Auth; account transition remains a separate migration step.

## Next
Migrate direct frontend `confluenceSupabase.rpc()` / `.from()` usage to `confluenceApi`, then switch a preview build to `neon` for real Auth + RLS testing against the validation branch.
