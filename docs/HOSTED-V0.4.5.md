# Hosted Connected Prototype v0.4.5 — Authentication & Test Player Support

## Authentication

The hosted login now offers two methods:

- Email + password (`signInWithPassword`)
- Email magic link (`signInWithOtp`)

Magic links remain enabled for first-time access and passwordless use, but routine sign-in
can use a password and does not consume an outbound authentication email.

Supabase session persistence and automatic token refresh are explicitly enabled in the
browser client.

## Setting a password

Any authenticated user can open **Account Security** and set or change their password.
This uses `auth.updateUser({ password })` on the currently authenticated account.

This is particularly useful for existing users who originally joined through magic
links: they sign in once, set a password, and can then use password login going forward.

## Test-player workflow

Recommended development setup:

1. Create or authenticate a dedicated email account once.
2. Add that authenticated account to The Shattering as a Player from the GM Dashboard.
3. While signed in as that test user, open Account Security and set a password.
4. Keep the GM account in Browser Profile A.
5. Keep the test-player account in Browser Profile B / another browser.
6. Use the two persistent sessions to test grants, character state, GM read-only access,
   and authorization boundaries without requesting repeated magic-link emails.

## Email limits

Magic links continue to use Supabase's email delivery service and are therefore subject
to email rate limits. Password sign-in does not send an authentication email.
