# v0.4.10.5 — Incremental Training Maximum Persistence Fix

Fixes the System Data Studio serializer/deserializer for Essence milestone choices using:

`Increase Training One Step`

The Maximum proficiency (`max_status`) is now preserved through:
- Save Essence
- reload from Supabase
- reopen Essence in System Data Studio

Example:
Blade Specialization can now correctly retain:
- Light Blade -> Increase Training One Step -> Maximum Expert
- Heavy Blade -> Increase Training One Step -> Maximum Expert

Existing definitions that were already saved incorrectly as Trained must be changed back
to Expert once after deploying this fix, then saved again.

No database schema migration is required.
