# Hosted Connected Prototype v0.4.9.4 — Skill XP Advancement & Scaled Power Costs

## Skills
Skill Rank can no longer be freely edited from the Training tab.
Untrained Skills are Rank 0. Training grants Rank 1 at no XP cost.
Players advance trained Skills one Rank at a time through a Rank Up button.

New-rank XP costs:
2=10, 3=15, 4=20, 5=25, 6=35, 7=45, 8=60, 9=75, 10=100.

Hard caps:
Iron 10, Bronze 20, Silver 30, Gold 40, Platinum+ no effective cap.

The backend performs the XP check, deduction, rank update, and XP ledger transaction
atomically with `player_rank_skill`. Costs above Rank 10 are intentionally not
configured yet, so Bronze+ advancement will stop cleanly until that progression is set.

## Powers
Power Rank costs now scale by the new Rank:
2=10, 3=15, 4=20, 5=25, 6=30, 7=35, 8=40, 9=50, 10=60.

`player_rank_power` now calculates and deducts the correct cost atomically and records
the transaction in the XP ledger. Power Rank 1 remains granted.
