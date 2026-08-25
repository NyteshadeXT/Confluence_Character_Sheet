# v0.4.10.6.1 — Incremental Training Single-Application Fix

Fixes Essence milestone choices using `Increase Training One Step` applying twice.

The effect is now idempotent and tracked per resolved permanent milestone choice.

Expected behavior with maximum Expert:
- Untrained -> Trained
- Trained -> Expert
- Expert -> Expert

A single choice selection can no longer advance two proficiency steps.

Existing characters that were incorrectly advanced to Expert by the prior bug may need
their affected Training entry manually corrected once.
