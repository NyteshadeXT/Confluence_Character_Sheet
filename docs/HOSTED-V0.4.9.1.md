# Hosted Connected Prototype v0.4.9.1 — Essence Milestone Choices

## Permanent milestone choices

Essence Mastery Milestones can now contain a structured permanent choice.

A choice has:
- stable Choice ID
- player-facing prompt
- two or more options
- one or more structured effects on each option

Supported option effects:
- Attribute
- Defense
- Initiative
- Weapon / General Attack
- Power Attack Ability
- Skill
- Training

The player's selection is stored in the existing `essence_choices_json` character state.
Once selected it resolves into ordinary milestone effects and is included in all
derived-stat calculations.

Examples:
- Disciplined Intellect: Intelligence +1 OR Wisdom +1
- Master of Thought: Initiative +1 OR Will +1
- a choice can also grant Training as one of its Rank Effects.

## Power Attack Ability

Adds `modify_power_attack_ability`. This allows a milestone such as:
`+1 to attack rolls with Strength-based Powers`
without also modifying weapon attacks, Strength checks, or unrelated rolls.

The power attack engine first resolves the Power's attack ability and applies matching
Essence milestone bonuses.

## Training Interaction retired

The standalone Essence `Training Interaction` editor is hidden and no longer written to
new Essence definitions.

Training is now simply another possible Rank Effect:
- direct milestone: Training → Light Blade → Trained
- milestone choice: Light Blade training OR Heavy Blade training

Existing legacy `grant_training_choice` data remains readable for compatibility, but
new Essence authoring should use Rank Effects / Milestone Choices.
