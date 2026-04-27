# Sauce Labs Agent Skills

This repository provides example Agent Skills that you can use with common AI coding agents.

If you are new to agents, think of a skill as a reusable instruction pack that helps your agent perform a task consistently.

## What this repository is for

Use these skills to:

- Standardize how your agent handles Sauce Labs workflows
- Reuse proven instructions across projects
- Reduce repeated prompt writing

## Where to install skills

Most agent tools discover skills from one of two places:

### Project-level skills (shared with your team)

- .github/skills
- .claude/skills

Use project-level skills when you want everyone in the repository to follow the same behavior.

### User-level skills (personal defaults across projects)

- ~/.copilot/skills
- ~/.agents/skills

Use user-level skills when you want your own reusable setup across many repositories.

## Quick start for new users

1. Pick a location: project-level or user-level.
2. Copy this skill folder into your chosen skills directory.
3. Start your agent in a repository where the skill is available.
4. Ask the agent to perform a Sauce Labs task and reference the skill by name if needed.

## Recommended directory layout

This repo follows the Agent Skills pattern and is intended to live under:

./agents/skills

If your environment uses a different path, place the skills in the folder your agent tool scans.

## Tested environments

These skills have been tested with:

- Microsoft Visual Studio Code with GitHub Copilot Pro
- Google Antigravity with Gemini 3.1 Pro

## Notes

Agent platforms evolve quickly. If discovery behavior changes, verify your tool's latest skills directory conventions and update your local setup accordingly.
