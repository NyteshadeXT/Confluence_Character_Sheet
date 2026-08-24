# Hosted Connected Prototype v0.4.9.8.1 — Cumulative Rank Expression Fix

Rank Expressions now resolve cumulatively in ascending Rank order.

A Rank 6 Power first applies its Rank 3 changes and then applies its Rank 6 changes
to that already-resolved model.

The resolver now:
- merges both supported Rank Expression storage locations;
- sorts all reached expressions by Rank;
- de-duplicates repeated definitions;
- applies structured operations sequentially;
- supports common legacy damage-scaling text as a fallback;
- preserves unresolved Rank Expression text in Applied Rank Effects.

No database schema change is required.
