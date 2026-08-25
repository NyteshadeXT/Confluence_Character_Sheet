# v0.4.10.3 — Incremental Training Milestones

Adds a new Essence milestone mechanical effect:

**Increase Training One Step**

The effect raises the target Training entry by exactly one proficiency step, with a
configurable maximum.

Example with maximum Expert:
- Untrained -> Trained
- Trained -> Expert
- Expert -> Expert

This effect works both as an always-on milestone effect and inside a Permanent Milestone
Choice.

Blade Rank 6 example:
- Milestone: Blade Specialization
- Add Permanent Choice
- Option 1: Light Blade Group Proficiency
  - Effect: Increase Training One Step
  - Target: Light Blade
  - Maximum: Expert
- Option 2: Heavy Blade Group Proficiency
  - Effect: Increase Training One Step
  - Target: Heavy Blade
  - Maximum: Expert

Text shorthand for direct milestones:
`training_step | Light Blade | Expert`

No database schema migration is required.
