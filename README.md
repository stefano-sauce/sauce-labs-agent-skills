# Sauce Labs Agent Skills Example

This repository is intended to be an example structure that Sauce Labs customers can incorporate into their own agentic workflows.

The examples in this repo are focused on WebdriverIO, but they are designed to be easily tweaked and fine-tuned to meet each customer's specific test framework requirements.

## References Folder

The `reference/` folder contains supporting documentation used by the agent:

- `ELEMENTS.md` is a reference for all documented elements of the mobile app that the agent is expected to use when writing additional automated scripts.
- `SAUCE-RDC.md` contains configuration details and reference information for advanced Sauce Labs Real Device Cloud functionality.

## Prompts Folder

The `prompts/` folder contains detailed prompts designed to make the generation and recreation of automated tests repeatable and consistent. Using these prompts ensures the agent produces reliable, predictable results each time it is asked to write or regenerate test scripts.

## Tools

So far I have tested this with the following setups:

- ✅ Microsoft Visual Studio Code + GitHub Copilot Pro
- ✅ Google Antigravity + Gemini 3.1 Pro
