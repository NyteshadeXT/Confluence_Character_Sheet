# Hosted v0.4.11.6 — Provider-Neutral Frontend Data Calls

This release moves application database calls behind `confluenceApi` while Supabase remains the default provider.

## Changes
- Replaced application-level `confluenceSupabase.rpc()` calls with `confluenceApi.rpc()`.
- Replaced application-level `confluenceSupabase.from()` calls with `confluenceApi.from()`.
- Added a lazy PostgREST-compatible query builder so existing `.select().eq().order()` chains work while the active provider client is resolved asynchronously.
- Preserved `{ data, error }` result semantics during migration to minimize behavior changes.
- Account user updates now route through `confluenceAuth`.
- Auth callback now uses provider-neutral session polling instead of Supabase `onAuthStateChange`.
- Legacy `supabase-auth.js` remains as the Supabase provider implementation while Supabase is the default.

## Cutover status
The application still defaults to Supabase. This release is intended to make a Neon preview-provider switch possible without rewriting page logic again.

## Next
Audit remaining provider-specific references, migrate any remaining auth-page assumptions, then create a Neon-enabled preview build against `confluence-rpc-validation` for browser Auth/JWT/RLS testing.
