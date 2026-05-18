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

## Sauce AI — AI-powered test generation and execution

The `sauce-ai` skill unlocks a second way to run tests on Sauce Labs infrastructure: instead of writing test code yourself, you describe what you want to test in plain language and let the Sauce Labs AI Authoring API generate and run it for you.

### How it works

The two paths produce different outputs. Your agent picks the right one based on what you say — but the same test description worded differently can mean either path, so being explicit avoids a clarifying question.

| What you want | What the agent does |
|---|---|
| A test that runs in the Sauce Labs platform with no code written | Calls the Sauce Labs AI Authoring API — test lives in the platform, no files created in your repo |
| Test code you own, commit, and run via CI | Writes test code (`.js`, `.py`, etc.) and uses `sauce-rdc` or `sauce-vdc` to produce the right capabilities |
| Ambiguous prompt (no explicit signal either way) | Asks: "Do you want test code in your repo, or Sauce Labs AI to run it in the platform with no code?" |

The Sauce AI API flow is asynchronous: generate → poll → run → results link.

### Same goal, two different prompts

This example shows how to phrase the same test intent for each path.

**Using Sauce Labs AI (no code, runs in the platform):**
```
Using Sauce AI, generate a test that goes to https://www.saucedemo.com, logs in with
standard_user / secret_sauce, adds an item to the cart, and checks out.
Run it on Chrome on Windows 11 and give me the results link.
```

**Using Claude Code / Copilot / any agent (writes test code into your repo):**
```
Write a WebdriverIO test that goes to https://www.saucedemo.com, logs in with
standard_user / secret_sauce, adds an item to the cart, and checks out.
Run it on Sauce Labs on Chrome on Windows 11.
```

The key difference: **"Using Sauce AI"** tells the agent to call the Sauce Authoring API. **"Write a WebdriverIO test"** tells it to produce code in your framework.

### More prompt examples — Sauce Labs AI path

**Mobile web test:**
```
Using Sauce AI, create a test for https://www.saucedemo.com that verifies the login
page loads correctly on a real iPhone using Safari. Run it and return the results link.
```

**Run an existing test case:**
```
Run Sauce Labs AI test case 64f1a2b3c4d5e6f7a8b9c0d1 with build name "release-2.1".
```

**Run all tests in a suite:**
```
Run all test cases in Sauce Labs test suite abc123def456 and give me the results link.
```

**Create a suite and schedule it:**
```
Create a Sauce Labs test suite called "Nightly Smoke" with test cases
64f1a2b3c4d5e6f7a8b9c0d1 and 64f1a2b3c4d5e6f7a8b9c0d2, then schedule it to run
every weekday at 9 AM Pacific.
```

**List test cases:**
```
List all Sauce Labs AI test cases created this week.
```

### More prompt examples — agent-driven path (Claude Code, Copilot, etc.)

**Add a test to an existing suite:**
```
Write a WebdriverIO test and add it to my existing suite. It should log into
https://www.saucedemo.com and verify the products page loads. Run it on a real iPhone
via Sauce Labs RDC.
```

**Generate capabilities for a new test file:**
```
I'm writing a pytest + Appium test for our Android app stored in Sauce storage as
myapp.apk. Give me the Sauce Labs capabilities to run it on a real Android device.
```

**Troubleshoot a failing test:**
```
My Sauce Labs test is failing with a session creation error. Here are the capabilities
I'm using — what's wrong?
```

**Update capabilities for a new platform:**
```
Update my existing WebdriverIO capabilities to also run on iOS Safari on a real device
using Sauce RDC.
```

### Tips for best results

- Say **"using Sauce AI"** or **"write a [framework] test"** to avoid a clarifying question.
- The more specific your intent description, the better the Sauce AI-generated test. Include expected outcomes, not just actions (e.g. "verify the order confirmation page shows" not just "check out").
- The agent needs `SAUCE_USERNAME`, `SAUCE_ACCESS_KEY`, and `SAUCE_REGION` set **before** it runs. Variables exported in a separate terminal are not visible to the agent — use a `.env` file in the repo root instead (it is gitignored):
  ```
  SAUCE_USERNAME=your_username
  SAUCE_ACCESS_KEY=your_access_key
  SAUCE_REGION=eu-central-1
  ```
  If variables are missing the agent will print a clear message and stop — it will not prompt you for credentials.
- For tests behind a firewall or on localhost, add "use Sauce Connect tunnel my-tunnel-name" to your prompt.
- If Sauce AI generation fails, try simplifying the intent or splitting it into smaller test cases.

## Tested environments

These skills have been tested with:

- Microsoft Visual Studio Code with GitHub Copilot Pro
- Google Antigravity with Gemini 3.1 Pro

## Notes

Agent platforms evolve quickly. If discovery behavior changes, verify your tool's latest skills directory conventions and update your local setup accordingly.
