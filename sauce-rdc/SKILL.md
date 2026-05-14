---
name: sauce-rdc
description: Generate and validate Sauce Labs Real Device Cloud (RDC) Appium capabilities for Android and iOS real-device sessions.
when_to_use: Use when the user asks to create, update, troubleshoot, or review Sauce Labs capabilities for real mobile devices, including RDC-specific features such as biometrics, network throttling, vitals, and media capture.
---

# Sauce Labs Real Device Cloud (RDC)

## Scope
Apply this skill only to Sauce Labs real mobile devices (RDC).

Do not include guidance that is desktop-only, emulator-only, or simulator-only.

## Capability Authoring Rules
When generating capabilities:
- Use W3C-style keys (`platformName`, `appium:*`, `sauce:options`).
- Always include `sauce:options`.
- Always include a meaningful `sauce:options.build` value.
- Set `sauce:options.resigningEnabled: true` for RDC advanced features.
- Prefer dynamic real-device allocation unless the user requests a fixed device:
  - Android family pattern example: `appium:deviceName: Google.*`
  - iOS family pattern example: `appium:deviceName: iPhone.*`
- Use Sauce storage references for app binaries unless the user provides another source.

## Canonical RDC Templates

### Android Real Device App Session
```yaml
platformName: Android
appium:app: storage:filename=<app_name>.apk
appium:deviceName: Google.*
appium:automationName: UIAutomator2
sauce:options:
  build: Relevant Build Name
  name: Relevant Test Name
  appiumVersion: latest
  resigningEnabled: true
```

### iOS Real Device App Session
```yaml
platformName: iOS
appium:app: storage:filename=<app_name>.ipa
appium:deviceName: iPhone.*
appium:automationName: XCUITest
sauce:options:
  build: Relevant Build Name
  name: Relevant Test Name
  appiumVersion: latest
  resigningEnabled: true
```

## RDC Advanced Feature Flags
Enable only what the user asks for.

- `audioCapture: true`
- `biometricsInterception: true`
- `allowTouchIdEnroll: true` (iOS)
- `bypassScreenshotRestriction: true` (Android)
- `crashReporting: true`
- `enableAnimations: true` (Android)
- `groupFolderRedirectEnabled: true` (iOS app group behavior)
- `imageInjection: true`
- `networkCapture: true`
- `networkProfile: <profile_id>`
- `systemAlertsDelayEnabled: true` (iOS)
- `vitals: true`

## Runtime Commands

### Biometric Simulation
```javascript
driver.execute('sauce:biometrics-authenticate=true');
driver.execute('sauce:biometrics-authenticate=false');
```

### Change Network Profile During Session
```javascript
driver.execute('sauce: network-profile=3G-fast');
driver.execute('sauce: network-profile=no-throttling');
```

## Supported Network Profile IDs
- `no-throttling`
- `no-network`
- `2G-packet-loss`
- `2G`
- `3G-slow`
- `3G-fast`
- `4G-slow`
- `4G-fast`

## Validation Checklist
Before returning capabilities, verify:
- `platformName` is `Android` or `iOS`.
- `appium:automationName` matches platform (`UIAutomator2` or `XCUITest`).
- `appium:app` uses a valid source (prefer `storage:filename=...`).
- `sauce:options.build` is present and meaningful.
- `sauce:options` is present.
- If advanced RDC features are used, `resigningEnabled: true` is present.

## Output Preference
When the user asks for capabilities, return compact YAML by default and add brief notes only for non-obvious options.
