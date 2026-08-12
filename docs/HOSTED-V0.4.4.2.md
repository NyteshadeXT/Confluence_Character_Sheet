# Hosted Connected Prototype v0.4.4.2

## Character loading correction

The character sheet HTML still contained `Skarr` as static pre-load display text.
That did not come from Supabase, but it was misleading whenever a Character failed to
load.

v0.4.4.2:

- replaces the static character name with `Loading Character…`;
- hides the complete Character UI until a valid Supabase snapshot succeeds;
- never displays GM Read-Only mode until a valid Character and campaign role are known;
- displays `Character Unavailable` for stale/deleted Character URLs;
- explains that a deleted Character should be reselected from the Character Portal;
- does not render any blank/prototype sheet beneath a load failure.

## Athengar test record

The earlier Athengar test Character referenced by
`2ae2da5e-f203-4790-b7b9-758b54bd1037` no longer exists in the live database.

The registered player currently owns a different valid Character record, `Exenox`
(Runic). The Character Portal should be used to open that current record rather than an
old bookmarked Athengar URL.
