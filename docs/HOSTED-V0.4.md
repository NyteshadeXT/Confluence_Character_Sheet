# Hosted Connected Prototype v0.4

Supabase project: Confluence Character.

The database foundation, RLS, game catalog, and protected RPCs are already applied to the live Supabase project.

## Authentication
The hosted UI uses Supabase email magic-link authentication. The publishable key in `web/supabase-config.js` is intentionally client-safe. No service-role key is present in the frontend.

## Required dashboard configuration before public login testing
Set Supabase Auth Site URL to the eventual HTTPS deployment URL and add `/auth-callback.html` to Redirect URLs.

## Deployment
Deploy the contents of `web/` as a static site. Vercel is recommended.

## Current limitation
A campaign and character cannot be assigned to a player until that player has an Auth user. After each player signs in once, their profile exists and the GM can link the character to that UUID.
