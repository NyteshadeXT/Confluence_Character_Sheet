# v0.4.11.3 — Neon Auth UUID Compatibility

Corrects the Neon target after direct inspection of the provisioned Neon Auth schema.
`neon_auth."user".id` is UUID, not text. Confluence therefore preserves UUID user-reference
columns and casts Neon Data API `auth.user_id()` to UUID through `public.current_user_id()`.

The Neon Data API prerequisite was provisioned and verified before this correction.
No production Confluence schema has been merged yet.
