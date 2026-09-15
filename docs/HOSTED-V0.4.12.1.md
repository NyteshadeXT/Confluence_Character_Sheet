# Hosted v0.4.12.1 — RPC Deployment Readiness

## Goal

Turn the reconciled Neon RPC contract into a deployment-ready package without changing either Neon production or the disposable validation branch.

## Changes

- Added `neon/05_neon_rpc_permissions.sql` to remove anonymous/public execution from the browser-facing RPC surface and grant execution to Neon's `authenticated` role.
- Added `neon/06_neon_rpc_contract_check.sql`, a read-only post-deployment signature assertion. A correct deployment returns zero rows.
- Rewrote `neon/README.md` to describe the current UUID identity model and canonical v0.4.12 RPC signatures; removed stale owner-assignment/signature guidance from the older migration package.
- Preserved the canonical server-side Power Rank, Skill Rank, XP, ownership, GM, and Power-definition cleanup logic.
- Updated visible integration-candidate version labels to v0.4.12.1.

## Safety

No Neon database writes are part of this release. Supabase remains the production/default frontend provider. The Neon Data API `jwk not found` issue remains externally escalated and is not worked around in application code.
