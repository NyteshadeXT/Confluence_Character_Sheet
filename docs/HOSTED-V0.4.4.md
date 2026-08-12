# Hosted Connected Prototype v0.4.4 — Character Creation & Loading Fixes

- Adds Ancestry master data and an Ancestry module to System Data Studio.
- Player and GM character creation require an active Ancestry ID; free-text ancestry is rejected server-side.
- Player portal lists owned Characters explicitly and creation remains on the portal so the player selects which Character to open.
- Removes all Skarr/Leonid/Axe/Quarterstaff prototype fallback state from the hosted Character UI.
- Character load failures now display an error instead of rendering prototype defaults.
- Character sheets use the selected Ancestry definition for attribute/resource modifiers.
- Campaign GMs can permanently delete a Character after typing its name to confirm.
- GM character views remain read-only; Character Owners receive the editable sheet.
