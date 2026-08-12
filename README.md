# Confluence Character Sheet

Hosted character-management application for the **Confluence System**.

This repository is intentionally separate from the `Confluence_System` Obsidian vault.

## Current milestone

**Hosted Connected Prototype v0.4**

The frontend is a static Vercel application backed by Supabase Auth, PostgreSQL, Row
Level Security, and protected RPC functions.

## Repository structure

```text
/
├── index.html                  Authenticated character portal
├── login.html                  Supabase magic-link login
├── auth-callback.html          Auth callback
├── gm.html                     Authenticated GM dashboard
├── styles.css
├── supabase-config.js          Client-safe Supabase URL/publishable key
├── supabase-auth.js            Auth helpers
├── character/
│   ├── index.html              Full character sheet
│   ├── app.js
│   └── styles.css
├── docs/
├── supabase/
└── vercel.json
```

## Deploy to Vercel

Import this GitHub repository into the existing Vercel project **Confluence Character**.

The repository root is the Vercel Root Directory. No build command is required; this is
a static site.

After Vercel provides the stable HTTPS production URL, configure Supabase Authentication:

1. Set **Site URL** to the Vercel production URL.
2. Add `<production-url>/auth-callback.html` to allowed Redirect URLs.

## Authentication

The current prototype uses Supabase email magic-link authentication.

The publishable key in `supabase-config.js` is client-safe. No service-role key belongs
in this repository.

## Current onboarding limitation

A player's Auth user must exist before their Character can be linked to that account.
Character creation/invitation administration is the next hosted workflow to finish.

.
