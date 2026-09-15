# Hosted v0.4.11.8 — Neon Validation Account Bootstrap

This release removes email delivery as a blocker for Neon migration validation.

## Changes
- Added provider-neutral `confluenceAuth.signUp()`.
- Added `neon-test-account.html`, a validation-only Neon email/password account creation page.
- The setup page refuses to operate unless Neon is active.
- Added 15-second authentication timeouts on the validation signup and existing login operations where supported.
- Production/default backend remains Supabase.

## Validation workflow
Deploy on `neon-migration`, open `/neon-test-account.html?backend=neon`, create a disposable password account, then verify `/neon-validation.html?backend=neon`.

The magic-link delivery issue remains non-blocking until the core Auth/JWT/Data API/RLS path is proven.
