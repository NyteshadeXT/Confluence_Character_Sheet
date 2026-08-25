# Confluence Character Sheet

Hosted character-management application for the **Confluence System**.

This repository is intentionally separate from the `Confluence_System` Obsidian vault.

## Current milestone

**Hosted Connected Prototype v0.4.10.6 — Authentication & Test Player Support**

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


## v0.4.10.6 Authentication & Test Player Support
Adds persistent password sign-in alongside magic links and an authenticated Account Security page for setting/changing a password. No database schema migration is required.


## v0.4.10.6 Player UI Stabilization
Repairs hosted character hydration, restores deterministic full-sheet loading, adds ancestry-aware creation previews, responsive attribute creation, and consistent navigation buttons.


## v0.4.10.6 Character Load Hotfix
Removes duplicate browser session checks and adds hard timeouts so character loading cannot hang indefinitely.


## v0.4.10.6 Character Asset Routing Fix
Fixes Vercel clean-URL asset resolution so the Character page loads `/character/styles.css` and `/character/app.js` instead of root portal assets.


## v0.4.10.6 Character Usability & GM Assignment Controls
Adds Saving Throws training organization, wider proficiency controls, ancestry-power definition support, stronger equipped-item highlighting, clearer durability repair wording, GM removal of assigned Essences/Powers, and sticky GM Power Essence selection.


## v0.4.10.6 System Rules Expansion
Promotes Conditions to master system data with structured modifier integration, expands
Power authoring/rendering to the full Confluence Power presentation, adds owned-equipment
removal, and hides redundant weapon focus controls for single-group weapons.


## v0.4.10.6 Essence Progression
Expands Essence authoring into tiered resource progression, training interactions, mastery milestones, and derived Power relationships. Character calculations consume these definitions directly.


## v0.4.10.6 Essence Milestone Choices
Adds first-class permanent milestone choices, Power Attack Ability milestone effects,
and retires standalone Essence Training Interaction. Training is now authored only as
a Rank Effect.


## v0.4.10.6 Combat Cards & Power Formatting
Adds collapsed/expanded/full Combat Power cards, formatted multiline Power text,
Implement-keyword and Round-based attack milestone effects, and per-slot Essence Power
coverage in System Data Studio.


## v0.4.10.6 Rich Text Render Hotfix
Fixes `esc is not defined` in player Power rendering introduced by v0.4.9.2.


## v0.4.10.6 Game Night Progression Corrections
Corrects Skill, Essence, and Power starting ranks; surfaces final Skill modifiers in
Training; and activates structured ancestry passive resource progression.


## v0.4.10.6 Skill XP Advancement & Scaled Power Costs
Adds atomic player Skill Rank purchasing with tier caps and the agreed Rank 2–10 Skill
cost curve. Replaces flat Power Rank cost with the escalating Rank 2–10 curve.


## v0.4.10.6 Weapon Skill Advancement & Compact Player UI
Weapon Skills now spend XP on the same curve and tier caps as character Skills.
The player sheet receives a compact desktop layout with two-column Training, denser
resources/attributes/defenses, collapsible Rest, and collapsed Power groups.


## v0.4.10.6 Resolved Power Display
Power cards now show calculated Power Attack modifiers, source-Essence damage types, and
Rank Expression changes directly in the displayed Power. Also removes the `R` prefix
from Training Rank badges.


## v0.4.10.6 Character Rank Mathematics
Replaces automatic Power-Rank attack scaling with the universal Character Rank Bonus.
Rank Bonus now applies exactly once to attacks, AC, Fortitude, Reflex, and Will, with
explicit Math breakdowns. Power Rank remains Power-development progression only.


## v0.4.10.6 Unified Training & Mastery Mathematics
Adds half-rate `ceil(Rank/2)` combat mastery for Power attacks, Weapon Skills,
Armor/Shields, and Saving Throws; keeps full Skill Rank on Skill checks; gives
Armor/Shield/Save training numeric rank advancement; and formalizes 10 base HP.


## v0.4.10.6 Cumulative Rank Expression Fix
Fixes Power resolution so every reached Rank Expression is applied in order, allowing
later Rank abilities to build on earlier ones.


## v0.4.10.6
Adds the form-based Rank 3/6/9 Power progression builder and structured Power mutations.


## v0.4.10.6
Adds power-specific attack ability choices, structured defense targeting, and richer Rank rider mutations.


## v0.4.10.6 Rank Mutation Resolver Fix
Executes Modify Existing Effect and Enhance Existing Effect operations in the
resolved Power. Existing owned Powers and definitions require no re-entry.


## v0.4.10.6 Incremental Training Milestones
Adds Essence milestone effects that increase a Training proficiency by one step with a
configurable maximum, including use inside permanent milestone choices.


## v0.4.10.6 Hierarchical Rank Progression
Five Power slots determine each Essence and four Essences determine Character Rank.
Empty Power slots count as Iron 1, and a tier transition requires every contributor to
cross the threshold. Legacy Iron 10 Power records normalize to Bronze 0.


## v0.4.10.6 Training Maximum Persistence Fix
Preserves `max_status` for Increase Training One Step milestone effects across Save and reload.


## v0.4.10.6 Essence Training Choice UI Fix
Shows unresolved Essence training choices directly in the Training tab and applies the
selected proficiency increase immediately.
