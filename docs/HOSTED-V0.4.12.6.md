# Hosted v0.4.12.6 — RPC Contract Drift Guard

## Changed

- Added `neon/rpc-contract.json` as a machine-readable inventory of the browser RPC boundary.
- Added `tools/validate-rpc-contract.mjs`, a read-only static validator that checks the browser RPC allowlist against the canonical Neon SQL definitions, authenticated RPC permission package, and post-deployment contract check.
- The validator also fails if application code reintroduces the removed `confluenceApi.from()`, `query()`, or `select()` table/query escape hatches.
- Updated the provider-neutral facade header to v0.4.12.6.

## Why this matters

The application now depends on an explicit RPC boundary. Before this release, the same contract was represented in several places and could drift as development continued. This release turns that architectural rule into an automated release check so a new frontend RPC cannot silently ship without its backend definition, permission declaration, and deployment verification entry.

## Backend impact

None. This release does not execute SQL, change RLS, alter Neon Auth/Data API configuration, migrate data, or modify Supabase production. `rpc-contract.json` and the validator are development/release tooling only.

## Validation

Run:

```bash
node tools/validate-rpc-contract.mjs
```

A valid build reports the number of browser RPCs and exits successfully. Any contract drift exits non-zero with the missing or unexpected RPC name.
