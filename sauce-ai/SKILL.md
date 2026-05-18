---
name: sauce-ai
description: Routing skill for Sauce Labs AI-powered test execution. Use when the user wants to generate, manage, or run tests on Sauce Labs infrastructure — decides whether to author test code directly (agent-driven) or invoke the Sauce Labs AI Authoring API.
when_to_use: Use when the user asks to create, generate, run, schedule, or manage tests on Sauce Labs, especially when no existing test framework is specified or when the user wants AI-generated tests from a natural-language description or URL.
---

# Sauce Labs AI Test Authoring — Routing & API Reference

## Routing Decision: Agent vs. Sauce Authoring API

The two paths produce **fundamentally different outputs**. Understand this before routing.

| | Sauce Authoring API path | Agent-driven path |
|---|---|---|
| **Output** | A test that lives inside the Sauce Labs platform — no code written | Test code (`.js`, `.py`, etc.) the user owns and commits |
| **Who runs it** | Sauce Labs AI runs it autonomously via the API | The user (or CI) runs the code against Sauce Labs infrastructure |
| **Persistence** | Test case stored in Sauce Labs, manageable via API/dashboard | Lives in the user's version-controlled codebase |
| **Best for** | Quick exploratory or smoke tests, no setup required | Tests that need to be maintained, reviewed, and integrated into a pipeline |

Apply this decision tree **before** writing any code or calling any API.

```
Does the user explicitly mention "Sauce AI", "Sauce authoring API", "no code", or "run it in the platform"?
├── YES → Sauce Authoring API path: POST /testcases/generate
└── NO ──→ Does the user name a framework or language (WebdriverIO, pytest, JUnit, Appium, etc.)?
            ├── YES → Agent-driven path: write test code + apply sauce-rdc or sauce-vdc skill
            └── NO ──→ Does the user say "write a test", "create a test file", or "add to my suite/repo"?
                        ├── YES → Agent-driven path
                        └── NO ──→ AMBIGUOUS: ask the clarifying question below before proceeding
```

### Clarifying question for ambiguous prompts

When the prompt could go either way (e.g. "generate a test that logs in and checks out on Chrome"), ask:

> "Do you want me to **write test code** you can commit to your repo and run via CI, or use **Sauce Labs AI** to generate and run the test directly in the platform with no code involved?"

Do not guess. Do not default to one path. Always ask this question when the intent is unclear.

### Explicit signal phrases — Sauce Authoring API path

The user's prompt includes one or more of:
- "using Sauce AI" / "via Sauce AI"
- "using the Sauce authoring API"
- "no code" / "without writing code"
- "run it in the platform" / "run it in Sauce Labs"
- "create and run a test case"
- "schedule a test to run every..."
- "manage my test cases / test suites"

### Explicit signal phrases — Agent-driven path

The user's prompt includes one or more of:
- "write a test" / "create a test file"
- names a framework or language: "WebdriverIO", "pytest", "JUnit", "Appium", "Selenium", "Playwright", "Java", "Python", "JavaScript", etc.
- "add to my suite" / "add to my repo"
- "update my existing test" / "fix this test"
- "help me write..."

---

## Environment Variables

All Sauce Authoring API calls depend on three environment variables. **Always resolve them before doing anything else.**

| Variable | Required | Description |
|---|---|---|
| `SAUCE_USERNAME` | Yes | Sauce Labs username |
| `SAUCE_ACCESS_KEY` | Yes | Sauce Labs access key |
| `SAUCE_REGION` | Yes | Region identifier — determines the base URL |

### Region → Base URL mapping

| `SAUCE_REGION` value | Base URL |
|---|---|
| `us-west-1` | `https://api.us-west-1.saucelabs.com` |
| `eu-central-1` | `https://api.eu-central-1.saucelabs.com` |

Always derive the base URL from `$SAUCE_REGION`. Never hardcode a region.

### How to resolve credentials

Agent tools run in their own shell process — variables exported in a separate terminal are not visible to the agent. Use one of these methods so the agent can read them:

**Option 1 — `.env` file in the project root (recommended)**

Create a `.env` file at the repo root (it is gitignored):
```
SAUCE_USERNAME=your_username
SAUCE_ACCESS_KEY=your_access_key
SAUCE_REGION=eu-central-1
```

The agent will source this file during the pre-flight check below.

**Option 2 — Agent tool environment settings**

For Claude Code: add the variables under `env` in `.claude/settings.json`:
```json
{
  "env": {
    "SAUCE_USERNAME": "your_username",
    "SAUCE_ACCESS_KEY": "your_access_key",
    "SAUCE_REGION": "eu-central-1"
  }
}
```

For GitHub Copilot or other agents: set the variables in your IDE or agent tool's environment configuration before starting the session.

**Option 3 — Shell profile**

Add `export` statements to `~/.zshrc` or `~/.bashrc` and restart your terminal and IDE.

### Pre-flight check — run this before any API call

```bash
# Source .env if present
[ -f .env ] && export $(grep -v '^#' .env | xargs)

# Verify all three are now set
MISSING=""
[ -z "$SAUCE_USERNAME" ]   && MISSING="$MISSING SAUCE_USERNAME"
[ -z "$SAUCE_ACCESS_KEY" ] && MISSING="$MISSING SAUCE_ACCESS_KEY"
[ -z "$SAUCE_REGION" ]     && MISSING="$MISSING SAUCE_REGION"

if [ -n "$MISSING" ]; then
  echo "Missing required environment variables:$MISSING"
  echo ""
  echo "Add them to a .env file in the project root:"
  echo "  SAUCE_USERNAME=your_username"
  echo "  SAUCE_ACCESS_KEY=your_access_key"
  echo "  SAUCE_REGION=eu-central-1"
  exit 1
fi

BASE_URL="https://api.${SAUCE_REGION}.saucelabs.com"
```

**If any variable is missing: print the message above and stop. Do not show a dialog. Do not prompt the user for input. Do not ask for credentials in the chat.**

### Authentication

All requests use **HTTP Basic Auth**: `$SAUCE_USERNAME` as the username, `$SAUCE_ACCESS_KEY` as the password.

```bash
curl -u "$SAUCE_USERNAME:$SAUCE_ACCESS_KEY" ...
```

---

## Core Workflow: Generate and Run a Test

This is the primary agentic flow when using the Sauce Authoring API path.

### Step 1 — Generate a test case (async)

```bash
TASK_ID=$(curl -s -u "$SAUCE_USERNAME:$SAUCE_ACCESS_KEY" \
  -X POST "$BASE_URL/v1/ai-authoring/testcases/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Human-readable test name (1–255 chars)",
    "runSettings": {
      "target": {
        "capabilities": { /* W3C capabilities — see sauce-rdc or sauce-vdc skill */ }
      },
      "testUrl": "https://example.com"
    },
    "promptSettings": {
      "intent": "Natural-language description of what the test should do",
      "maxSteps": 50
    },
    "timeout": 300000
  }' | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['taskId'])")
echo "taskId: $TASK_ID"
```

**Key constraints**:
- `intent` is required — it drives AI generation.
- `testUrl` is required for web flows.
- `timeout`: min 60000ms, max 3600000ms, default 300000ms (5 min).
- `maxSteps`: default 50, max 200.
- Returns `data.taskId` (UUID) — **generation is async**.

---

### Step 2 — Poll for generation status

```bash
until [ "$STATUS" = "COMPLETED" ] || [ "$STATUS" = "FAILED" ]; do
  sleep 5
  RESPONSE=$(curl -s -u "$SAUCE_USERNAME:$SAUCE_ACCESS_KEY" \
    "$BASE_URL/v1/ai-authoring/testcases/generate/$TASK_ID")
  STATUS=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['status'])")
  echo "status: $STATUS"
done
TEST_CASE_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data'].get('testCaseId',''))")
echo "testCaseId: $TEST_CASE_ID"
```

**Response statuses**:
- `QUEUED` — not yet started
- `IN_PROGRESS` — generation running
- `COMPLETED` — includes `testCaseId` for next step
- `FAILED` — includes `error` message; surface it to the user and stop

---

### Step 3 — Run the test case

```bash
RUN_RESPONSE=$(curl -s -u "$SAUCE_USERNAME:$SAUCE_ACCESS_KEY" \
  -X POST "$BASE_URL/v1/ai-authoring/testcases/$TEST_CASE_ID/run" \
  -H "Content-Type: application/json" \
  -d '{
    "buildName": "Optional build identifier",
    "targets": [{ "capabilities": { /* same capabilities as step 1 */ } }]
  }')

# The API's testUrl field returns the app URL under test, not the Sauce Labs dashboard.
# Derive the results link from jobs[0].id instead.
JOB_ID=$(echo "$RUN_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['jobs'][0]['id'])")
RESULTS_URL="https://app.${SAUCE_REGION}.saucelabs.com/tests/${JOB_ID}"
echo "Results: $RESULTS_URL"
```

**Important:** `data.testUrl` in the run response is the URL of the application being tested — not the Sauce Labs dashboard link. Always derive the results URL as:
```
https://app.{SAUCE_REGION}.saucelabs.com/tests/{jobs[0].id}
```

**Full request body reference**:
```json
{
  "buildName": "Optional build identifier",
  "targets": [
    {
      "capabilities": { /* W3C capabilities — use sauce-rdc or sauce-vdc skill */ }
    }
  ],
  "scTunnelName": "<tunnel-name> (optional)"
}
```

**Response** (`200 OK`):
```json
{
  "data": {
    "id": "<run-id>",
    "build": "<build-name>",
    "testCaseId": "<test-case-id>",
    "testUrl": "<app-url-under-test — NOT the results link>",
    "jobs": [{ "id": "<job-id>", "name": "<test-name>", "target": {} }],
    "creationDate": "<iso8601>",
    "orgId": "<org-id>",
    "teamId": "<team-id>",
    "userId": "<user-id>"
  }
}
```

---

## Test Case Management

### List test cases
```
GET $BASE_URL/v1/ai-authoring/testcases
```
Query params: `search`, `startDate`, `endDate`, `userId`, `teamId`, `testSuiteId[]`, `skip`, `limit`

### Get a test case
```
GET $BASE_URL/v1/ai-authoring/testcases/{id}
```
`id`: 24-character hex string.

### Rename a test case
```
POST $BASE_URL/v1/ai-authoring/testcases/{id}/rename
```
Body: `{ "name": "New name" }`

### Delete a test case
```
DELETE $BASE_URL/v1/ai-authoring/testcases/{id}
```
Returns `204 No Content` on success.

---

## Test Suite Management

### List suites
```
GET $BASE_URL/v1/ai-authoring/testsuites
```
Query params: `ids[]`, `search`, `startDate`, `endDate`, `userId`, `teamId`, `skip`, `limit`

### Create a suite
```
POST $BASE_URL/v1/ai-authoring/testsuites
```
Body:
```json
{
  "name": "Suite name",
  "testCases": ["<test-case-id>", "..."]
}
```

### Get a suite
```
GET $BASE_URL/v1/ai-authoring/testsuites/{id}
```

### Update a suite
```
POST $BASE_URL/v1/ai-authoring/testsuites/{id}
```
Body: `{ "name": "...", "testCaseIds": ["..."] }`

### Delete a suite
```
DELETE $BASE_URL/v1/ai-authoring/testsuites/{id}
```
Body: `{ "deleteTestCases": true }` — set to `true` to cascade-delete all test cases in the suite.

### Run all test cases in a suite
```
POST $BASE_URL/v1/ai-authoring/testsuites/{id}/run
```
Body: `{ "buildName": "Optional build name" }`

Returns `data` with `buildName`, `id`, `runCount`.

---

## Test Schedule Management

Schedules run suites automatically on a cron expression.

### List schedules
```
GET $BASE_URL/v1/ai-authoring/test-schedules
```
Query params: `ids[]`, `search`, `startDate`, `endDate`, `userId`, `teamId`, `testSuiteIds[]`, `skip`, `limit`

### Create a schedule
```
POST $BASE_URL/v1/ai-authoring/test-schedules
```
Body:
```json
{
  "name": "Schedule name",
  "settings": {
    "cron": "0 9 * * 1-5",
    "timezone": "America/Los_Angeles",
    "runningUserId": "<service-account-uuid>",
    "startDate": "<iso8601> (optional)",
    "endDate": "<iso8601> (optional)",
    "maxRuns": 100,
    "scTunnelName": "<tunnel> (optional)",
    "buildName": "<build> (optional)"
  },
  "testSuiteIds": ["<suite-uuid>"],
  "stateName": "ENABLED"
}
```

### Get a schedule
```
GET $BASE_URL/v1/ai-authoring/test-schedules/{id}
```

### Update a schedule
```
POST $BASE_URL/v1/ai-authoring/test-schedules/{id}
```
Body: same shape as create; any field can be updated. Pass `null` to clear optional fields (`startDate`, `endDate`, `maxRuns`, `scTunnelName`, `buildName`).

### Delete a schedule
```
DELETE $BASE_URL/v1/ai-authoring/test-schedules/{id}
```
Returns `204 No Content`.

---

## Artifact Storage

### Download a stored artifact (e.g. screenshot)
```
GET $BASE_URL/v1/ai-authoring/storage/{id}
```
Returns binary stream (`application/octet-stream`). `id` is an artifact UUID.

---

## Error Handling

| Code | Meaning |
|------|---------|
| `400` | Invalid request — check required fields and data types |
| `401` | Auth failure — verify `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` |
| `404` | Resource not found — verify IDs |
| `204` | Successful deletion — no body returned |

For generation failures (`status: FAILED`), surface the `error` field to the user with a suggestion to refine the `intent` prompt or verify the `testUrl` is accessible.

---

## Capability Handoff

When the Sauce Authoring API path requires W3C capabilities:
- For **real devices** → apply the `sauce-rdc` skill.
- For **desktop browsers or virtual devices** → apply the `sauce-vdc` skill.

Do not generate capabilities inline — delegate to the appropriate skill.

---

## Output Conventions

- Always return the Sauce Labs results URL (`testUrl`) after a run so the user can inspect results.
- For async generation, show a progress indicator and poll at 5-second intervals.
- Summarize what was created: test case name, suite (if any), run status, and results link.
