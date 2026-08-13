# Hosted Connected Prototype v0.4.6.2 — Character Asset Routing Fix

## Root cause

Vercel serves `/character/index.html` using its clean URL form `/character`.

The Character page used relative asset references:

- `styles.css`
- `app.js`
- `../supabase-config.js`
- `../supabase-auth.js`

At the clean URL `/character?character=...`, the browser resolved `styles.css` and
`app.js` relative to `/character` as root-level `/styles.css` and `/app.js`.

That caused:

- the portal stylesheet to be used instead of the Character Sheet stylesheet;
- `/character/app.js` to never execute;
- the sheet to stay permanently at `Loading Character…`;
- all Character buttons/tabs to appear dead;
- the hosted layout to look unlike the original v0.8-derived Character Sheet.

## Fix

Character assets now use absolute paths:

- `/character/styles.css`
- `/character/app.js`
- `/supabase-config.js`
- `/supabase-auth.js`

Character Portal navigation now uses `/`.

This makes the page work identically at `/character`, `/character/`, and
`/character/index.html` regardless of Vercel clean-URL normalization.

No database migration is required.
