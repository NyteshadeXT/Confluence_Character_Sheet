# Production Data Inventory

The live snapshot query verified:
- 6 profiles / campaign members
- 1 campaign (`The Shattering`)
- 5 characters
- 5 character owners
- 5 attribute records
- 5 runtime records
- 64 XP ledger entries
- 8 ancestry definitions
- 24 Essence definitions
- 16 Power definitions
- 7 condition definitions
- 32 Essence/Power eligibility links
- 4 assigned Essences
- 6 assigned Powers

Application data includes character training/equipment/loadout/Essence-choice JSON, runtime
resources/conditions/modifiers/daily state, Power tier/rank, Essence tier/rank, and the XP ledger.

The production query also verified that current Power definitions include the new
`attack_ability.mode = essence_alternate` model where configured (for example Cleave with
Strength as its alternate).
