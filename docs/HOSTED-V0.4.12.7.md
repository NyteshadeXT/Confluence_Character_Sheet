# v0.4.12.7 — MVP Readiness Smoke Test

Adds `/mvp-readiness.html?backend=neon`, a read-only browser acceptance gateway.

It checks: Neon provider selection; authenticated session; Data API RPC; home payload contract; active conditions; accessible campaign GM roster; first accessible character snapshot; system GM catalog (when authorized).

The report omits account identifiers, JWTs, passwords, character names and raw server errors. PASS indicates the named read-only check succeeded, not that every application operation works. SKIP indicates no test data/permissions; it is not a pass.

**Deployment prerequisites:** canonical Neon RPC package (including the v0.4.12.4 catalog functions) must be deployed to the *validation* branch, and the preview site must be configured to use that branch. A healthy `is_system_gm` response does not establish that the rest of the RPC package is deployed.

**Not tested here:** mutations, RLS denial tests, XP transactions, write persistence, data parity, account mapping, or production cutover. Those require controlled acceptance with test records after explicit approval.

**Safety:** No database migrations or writes in this release. Keep Supabase production untouched. Do not interpret a smoke-test pass as permission to cut over.
