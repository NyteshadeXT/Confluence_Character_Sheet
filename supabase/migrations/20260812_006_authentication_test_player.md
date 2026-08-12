# v0.4.5 authentication note

No PostgreSQL migration is required.

v0.4.5 uses existing Supabase Auth capabilities from the browser:
`signInWithPassword`, `signInWithOtp`, and authenticated `updateUser({ password })`.
