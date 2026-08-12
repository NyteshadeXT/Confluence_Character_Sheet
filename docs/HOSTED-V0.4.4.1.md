# Hosted Connected Prototype v0.4.4.1

Small presentation patch for the GM System Data Studio.

## Fixed

The v0.4.4 Ancestry editor template accidentally contained escaped newline tokens
(`\n`) as literal page text. Those tokens are now normal HTML whitespace/newlines and
no longer appear in the interface.

No Supabase schema or master-data changes are required for this patch.

## Ancestry library

The live system currently contains these active Ancestries:

- Auran
- Celestine
- Draconian
- Elf
- Human
- Leonid
- Runic
- Smoulder

Character-creation Ancestry selectors read the active list from Supabase, so these
definitions are available without hard-coding them into the frontend.
