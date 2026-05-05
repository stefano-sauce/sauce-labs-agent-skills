---
name: sauce-vdc
description: Sauce Labs VDC capability authoring skill for desktop and virtual devices. Use when asked to generate or validate W3C/Appium capabilities for Sauce Labs.
---

# Sauce Labs Virtual Device Cloud (VDC) Skill

## Scope
Use this skill when creating or updating Sauce Labs capabilities for:
- Desktop browser sessions
- Mobile virtual devices (Android emulators, iOS simulators)

## Global Authoring Rules
When generating capabilities:
- Always use W3C capability format.
- Always include `sauce:options`.
- Always include a meaningful `sauce:options.build` value.
- Prefer latest/stable client and driver versions unless user requests pinning.
- Keep secrets out of source code. Use env vars for `username` and `accessKey`.
- Adhere to the canonical capability of the users existing test suite.

## Required Baseline (Desktop + Mobile Browser)
- `browserName`: required when app capability is not set.
- `platformName`: required.
- `browserVersion`: desktop only.

### Browser Name Mapping
- Android <= 5 browser automation: `Browser`
- Android >= 6 browser automation: `Chrome`
- iOS browser automation: `Safari`
- Native/hybrid mobile app sessions: empty `browserName`

### Mobile Browser Constraint
- Do not set `browserVersion` for mobile browsers.

## Common W3C Optional Capabilities
Use as needed:
- `acceptInsecureCerts`
- `pageLoadStrategy`
- `proxy`
- `timeouts`
- `strictFileInteractability`
- `unhandledPromptBehavior`
- `webSocketUrl` (desktop only, beta, BiDi endpoint)

## Desktop Sauce Options (In sauce:options)
Commonly used:
- Driver/runtime pinning: `chromedriverVersion`, `edgedriverVersion`, `geckodriverVersion`, `iedriverVersion`, `seleniumVersion`
- Stability/timeouts: `commandTimeout`, `idleTimeout`
- Session behavior: `screenResolution`, `avoidProxy`
- Debug/perf: `extendedDebugging`, `capturePerformance`, `devTools`, `audioCapture`

### Desktop Compatibility Rules
- `capturePerformance` requires `extendedDebugging: true`.
- `webSocketUrl` is not compatible with `extendedDebugging`.
- `devTools` is not compatible with `extendedDebugging`.

## Mobile Appium Capability Rules
### Core Mobile Keys
- `platformName`: mandatory (Android or iOS).
- `appium:platformVersion`: mandatory for virtual devices
- `appium:deviceName`: mandatory for virtual devices
- `appium:automationName`: mandatory for Appium 2.

### App vs Browser Selection
At least one launch target should be provided:
- `browserName`, or
- `appium:app`, or
- iOS `appium:bundleId`, or
- Android `appium:appPackage` + `appium:appActivity`

## Mobile Timeouts (Appium)
Use when tuning flaky sessions:
- `appium:newCommandTimeout`
- `appium:autoWebviewTimeout` (Android)
- `appium:webviewConnectTimeout` (iOS)

### iOS WebDriverAgent Timeouts
- `appium:wdaLaunchTimeout`
- `appium:wdaConnectionTimeout`
- `appium:waitForIdleTimeout`
- `appium:commandTimeouts`

## Mobile Sauce Options (In sauce:options)
### Recommended Core
- `appiumVersion` (`latest` or `stable`)
- `build`
- `name`

### Device Selection and Session Flow
- `tabletOnly`, `phoneOnly`
- `privateDevicesOnly`, `publicDevicesOnly`
- `carrierConnectivityOnly` (private devices)
- `sessionCreationTimeout`, `sessionCreationRetry`
- `cacheId` for device reuse between tests

### Security/State and Locking
- `setupDeviceLock` must be paired with app launch capabilities.
- `resigningEnabled` controls iOS resigning / Android instrumentation.

## Network Throttling
Set at session start:
- `networkProfile`
- `networkConditions` with `downloadSpeed`, `uploadSpeed`, `latency`, `loss`

Set dynamically during session:
- execute script `sauce: network-profile`
- execute script `sauce: network-conditions`

## Logging and Privacy Controls
Use for sensitive data handling:
- `logFilters` (Appium 2.5.2+)
- `filterSendKeys`
- `recordLogs`
- `recordScreenshots`
- `captureHtml`
- `recordVideo`
- `videoUploadOnPass`

## Tunnel and Sharing Rules
- Prefer `tunnelName` over deprecated `tunnelIdentifier`.
- For shared tunnels, use `tunnelOwner` (not deprecated `parentTunnel`).
- For Appium W3C sessions, use `tunnelName` and `tunnelOwner`.

## Cross-Platform Sauce Metadata
Commonly include in `sauce:options`:
- `name`
- `build`
- `tags`
- `username`
- `accessKey`
- `public` visibility mode when needed

## Canonical Capability Templates
### Desktop Browser (Default)
```yaml
browserName: chrome
browserVersion: latest
platformName: Windows 11
sauce:options:
  build: Relevant Build Name
  name: Relevant Test Name
  seleniumVersion: latest
  screenResolution: 1920x1080
  idleTimeout: 90
```

### Mobile Browser
```yaml
platformName: iOS
browserName: Safari
appium:automationName: XCUITest
sauce:options:
  appiumVersion: stable
  build: Relevant Build Name
  name: Relevant Test Name
```

### Mobile App
```yaml
platformName: iOS
appium:automationName: XCUITest
appium:app: storage:filename=<app_name>
sauce:options:
  appiumVersion: stable
  build: Relevant Build Name
  name: Relevant Test Name
```

## Quick Decision Checklist
- Need WebDriver BiDi endpoint: set `webSocketUrl: true` and disable `extendedDebugging`.
- Need Chrome DevTools Protocol: set `devTools: true` and disable `extendedDebugging`.
- Need Sauce performance capture: set both `extendedDebugging: true` and `capturePerformance: true`.
- Need advanced RDC features: turn on `resigningEnabled: true`.
- Need secure logs: use `logFilters` and `filterSendKeys`.
