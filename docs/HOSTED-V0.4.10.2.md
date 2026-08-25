# v0.4.10.2 — Optional Essence Training Milestones

Training is now treated as an optional Essence Mastery Milestone effect rather than
a universal Training Interaction subsystem.

System Data Studio:
- Essence milestones may occur at arbitrary ranks through Rank 10.
- Direct training: `training | Athletics | Trained`
- Permanent training choices use the existing Permanent Milestone Choice builder.
- Each option can use Effect = Training, Target = the exact Training Library name,
  and Training = Trained/Expert/Master/etc.

Character:
- Reached `grant_training` effects automatically grant the proficiency.
- Choice-based training works through the generic permanent milestone choice system.
- Essence-granted training is marked in the Training tab with an Essence/rank badge.
- Existing Essence choices remain compatible.

Blade Rank 6 example:
Milestone: Blade Specialization
Permanent Choice:
- Light Blade Group Proficiency -> Training / Light Blade / Trained
- Heavy Blade Group Proficiency -> Training / Heavy Blade / Trained

No database migration is required.
