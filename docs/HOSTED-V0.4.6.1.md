# Hosted Connected Prototype v0.4.6.1 — Character Load Hotfix

The live Supabase snapshot was verified successfully for the Portal_Test owner account.
The remaining failure was isolated to the browser authentication/load sequence.

## Changes

- Removes the redundant second `requireSession()` call from every backend request.
- Character bootstrap authenticates exactly once before requesting the snapshot.
- Adds a 5-second authentication timeout.
- Adds a 10-second character snapshot timeout.
- Adds 10-second timeouts to runtime/profile/rank backend mutations.
- A stalled Supabase browser request now becomes a visible Character Load Error instead
  of leaving the page permanently at `Loading Character…`.
- Initial status now reads `Authenticating…` rather than the ambiguous `Connecting…`.

No database migration is required.
