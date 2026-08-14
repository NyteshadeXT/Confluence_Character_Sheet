# Hosted Connected Prototype v0.4.9.2.1 — Rich Text Render Hotfix

The v0.4.9.2 rich Power text formatter referenced `esc()`, a helper that exists in System Data Studio but not in the player Character application. That caused the Character render to throw `ReferenceError: esc is not defined` after the backend snapshot loaded.

This patch adds a Character-local HTML escaping helper and updates the rich Power formatter and keyword rendering to use it. No database migration is required.
