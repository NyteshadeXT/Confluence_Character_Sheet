# v0.3 Connection Architecture

```text
                         ┌──────────────────────────────┐
                         │        SQLite Database       │
                         │                              │
                         │ Campaign                     │
                         │ ├── Skarr                    │
                         │ └── Xavious                  │
                         └──────────────┬───────────────┘
                                        │
                                Python HTTP API
                                        │
                 ┌──────────────────────┼──────────────────────┐
                 │                      │                      │
          GM Dashboard            Skarr Full UI         Xavious Full UI
          gm-kyle                 player-skarr          player-xavious
                 │                      │                      │
       Grant XP / Essence /       Own Training /        Own Training /
       Power to selected ID       Equipment / Combat    Equipment / Combat
```

The Character ID is carried through every mutation.

Player state is never selected by display name.
