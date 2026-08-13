# Hosted Connected Prototype v0.4.6 — Player UI Stabilization

## Character loading
- Character snapshot now returns viewer owner/GM flags.
- Removed the second authorization RPC during sheet load.
- Full character UI is hidden until a snapshot has loaded and rendered successfully.
- Failure state uses both CSS and inline display control to prevent stale UI leaking through.
- Load failures include the actual backend/browser error message.

## Character creation
- Active Ancestry definitions include their modifier data in both Player and GM creation forms.
- Selecting an Ancestry immediately updates displayed starting attributes.
- Displayed starting scores include ancestry modifiers.
- The submitted base scores subtract the ancestry modifier so the character sheet does not apply it twice.
- Attribute grids use `minmax(0,1fr)` responsive columns and no longer overflow their panel.

## Navigation
Character Portal, Campaign Dashboard, System Data Studio, and Account Security navigation links are styled as normal UI buttons.

## Existing design
The full v0.8-derived Character Sheet remains the player interface. This patch does not replace it with a simplified hosted layout; it only controls when it becomes visible after backend hydration.
