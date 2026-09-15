# Hosted v0.4.11.7 — Neon Validation Preview

This release adds a controlled browser-validation mode without changing the production default.

## Validation mode
- `?backend=neon` selects Neon for the current browser session.
- `?backend=supabase` switches back.
- Without either parameter, existing/default behavior remains Supabase unless the validation session explicitly selected Neon.
- `neon-validation.html?backend=neon` performs read-only checks of session state and `is_system_gm()` through the Data API.

## Purpose
This is the first package designed for an end-to-end browser test of:
Managed Better Auth → browser session/JWT → Neon Data API → PostgreSQL RLS/RPC.

## Deployment
No production cutover is performed by this package. Deploy it only as a preview/staging build until the validation path passes.

## Vercel connector note
The connected Vercel team was visible during preparation, but it returned no projects through the connector, so this package was not automatically deployed to the existing Confluence project.
