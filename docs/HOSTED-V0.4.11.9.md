# Hosted v0.4.11.9 — Verified Neon Sign-Up Facade

This patch corrects the validation release by explicitly adding `confluenceAuth.signUp()` to the provider-neutral authentication facade.

## Verification guard
The validation account page now displays both:
- active provider (`neon`)
- `signUp facade: available`

Do not attempt account creation if the page reports `MISSING`.

## Deployment check
Before committing with GitHub Desktop, confirm `confluence-auth.js` appears in the Changes list. This file is required for the patch.

Production/default provider remains Supabase.
