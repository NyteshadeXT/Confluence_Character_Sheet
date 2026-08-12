# Hosted Connected Prototype v0.4.2

## GM Campaign Roster

The GM Dashboard now supports:

- adding an existing authenticated player to a campaign by email;
- creating an unclaimed character;
- setting starting ancestry and six starting attributes;
- assigning/reassigning a campaign Player as Character Owner;
- returning a Character to Unclaimed state;
- opening every Character Sheet in the campaign;
- existing XP, Essence, and Power assignment controls.

Players must sign into Confluence Character once before their email can be added. This
creates their Supabase Auth user without exposing service-role credentials to the
browser.

## GM Character Sheet Access

Campaign GMs may open any Character Sheet through `get_character_snapshot`.

The full sheet now detects ownership:

- Character Owner → normal editable Player interface.
- Campaign GM who is not the owner → full read-only interface.

GM read-only mode disables all character mutations while preserving tabs, inspection,
export, backend refresh, and navigation to the GM Dashboard.

## Backend synchronization repair

v0.4.2 also restores the complete Supabase snapshot/synchronization helper layer in the
hosted character bundle. Runtime and player-managed state are synchronized only for the
Character Owner. GM read-only views never send state updates.
