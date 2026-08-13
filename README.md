# Confluence Character Sheet

Hosted character-management application for the **Confluence System**.

This repository is intentionally separate from the `Confluence_System` Obsidian vault.

## Current milestone

**Hosted Connected Prototype v0.4.6.2 — Authentication & Test Player Support**

The frontend is a static Vercel application backed by Supabase Auth, PostgreSQL, Row
Level Security, and protected RPC functions.

## Repository structure

```text
/
├── index.html                  Authenticated character portal
├── login.html                  Supabase magic-link login
├── auth-callback.html          Auth callback
├── gm.html                     Authenticated campaign GM dashboard
├── content-studio.html         GM Essence & Power authoring
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


## v0.4.1 GM Content Studio

Authenticated GMs can open `content-studio.html` to manage the hidden shared system
library. The Studio creates/edits Essences, creates/edits Powers, manages multi-Essence
Power eligibility, and controls active/inactive status. Campaign assignment remains in
`gm.html`.


## v0.4.2 Campaign Roster

The GM Dashboard now supports player onboarding after first authentication, unclaimed
Character creation, Character ownership assignment, and read-only access to every
Character Sheet in the campaign.


## v0.4.4.2 Player Character Creation
Campaign Players can now create their own Characters from the authenticated portal after GM campaign membership is established. The GM-created/unclaimed Character path remains available.


## v0.4.4.2
Adds Ancestry master data, validated ancestry selection, reliable blank character loading, explicit character selection, and GM character deletion.


## v0.4.4.2
Fixes literal `\\n` text appearing in the GM System Data Studio. No database migration is required.


## v0.4.4.2
Removes the last static Skarr pre-load label and makes stale/deleted character URLs fail cleanly without rendering a character sheet.


## v0.4.6.2 Authentication & Test Player Support
Adds persistent password sign-in alongside magic links and an authenticated Account Security page for setting/changing a password. No database schema migration is required.


## v0.4.6.2 Player UI Stabilization
Repairs hosted character hydration, restores deterministic full-sheet loading, adds ancestry-aware creation previews, responsive attribute creation, and consistent navigation buttons.


## v0.4.6.2 Character Load Hotfix
Removes duplicate browser session checks and adds hard timeouts so character loading cannot hang indefinitely.


## v0.4.6.2 Character Asset Routing Fix
Fixes Vercel clean-URL asset resolution so the Character page loads `/character/styles.css` and `/character/app.js` instead of root portal assets.
