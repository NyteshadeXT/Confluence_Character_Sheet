# RC2 security audit

- Campaign creation requires `public.is_system_gm()` at both RPC and RLS policy levels.
- `public.confluence_gm` permits one GM via singleton primary key.
- GM access to existing campaigns uses `is_campaign_gm` and `is_system_gm`.
- Player ownership checks remain on skill and Power progression.

These are **static source assertions** only; authenticated integration tests are still required.
