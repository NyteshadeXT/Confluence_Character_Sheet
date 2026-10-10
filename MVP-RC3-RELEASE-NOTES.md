# MVP RC3 validation/security update

- Removed direct player UPDATE policy on `public.characters` to prevent bypassing XP and training RPC rules.
- Applied the equivalent policy removal to Neon validation only.
- Added read-only security regression checks.
- Authenticated gameplay testing, fresh schema installation and data migration rehearsal remain pending.
- No production deployment.
