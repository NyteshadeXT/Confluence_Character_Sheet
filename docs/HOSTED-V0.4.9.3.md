# Hosted Connected Prototype v0.4.9.3 — Game Night Progression Corrections

- Untrained Skills display Rank 0. Changing a Skill to Trained starts it at Rank 1.
- Training tab shows the current final Skill modifier beside each Skill.
- Essences and Powers now begin at Iron Rank 1.
- Existing live Rank 0 Essence/Power ownership records were migrated to Rank 1.
- Power rank purchases recalculate Essence Rank from a Rank 1 baseline.
- Ancestry progression passives are structured for all eight current Ancestries.
- Awakening supplies the first ancestry progression event; each completed Essence
  Development Tier adds another.
- Choice passives (Auran, Celestine, Human, Runic) prompt the player and persist the
  selected resource using character progression-choice state.
- Fixed passives (Draconian, Elf, Leonid, Smoulder) automatically affect resource maxima.
- Smoulder's Character Rank HP progression is also calculated.
