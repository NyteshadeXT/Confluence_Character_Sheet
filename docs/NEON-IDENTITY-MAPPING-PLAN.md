# Neon identity mapping for rehearsal

Source: Supabase (read-only). Target: isolated Neon rehearsal branch only.

Verified on 2026-10-09: six Supabase auth users, six distinct non-null emails. Neon rehearsal uses Better Auth.

Before copying operational data, create corresponding users through the supported Neon Auth directory interface, confirm notification behavior, and construct a one-to-one source UUID to target UUID mapping. Keep the mapping and email addresses outside the repository. Do not copy passwords or write directly into neon_auth tables.

Import profiles and campaign ownership after mapping; then characters, memberships, runtime state, progression assignments and XP ledger. Preserve original character and campaign IDs, remap only auth-user references, and verify foreign keys and row-level parity. Do not modify Neon production or Supabase.
