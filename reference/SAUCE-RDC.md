# Sauce Labs Real Device Cloud (RDC) Reference

## Sauce Labs Config
When generating or modifying configs:
- Always include services: ['saucelabs']
- Always use a broad appium:deviceName pattern (e.g., iPhone.*, Google.*,)
- Always include a build name
- Always target cloud execution

### Example Sauce Labs RDC Android Capabilities
```javascript
export const config = {
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    port: 443,
    path: '/wd/hub',
    region: 'us',
    services: ['saucelabs'],
    specs: [
        './test/specs/**/*.js'
    ],
    maxInstances: 10,
    capabilities: [{
        platformName: 'Android',
        'appium:app': 'storage:filename=app_name.apk',
        'appium:deviceName': 'Google.*',
        'appium:automationName': 'UIAutomator2',
        'sauce:options': {
            resigningEnabled: true,
            appiumVersion: 'latest',
            build: 'iOS Regression Suite',
        },
    }],
};
```

### Example Sauce Labs RDC iOS Capabilities
```javascript
export const config = {
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    port: 443,
    path: '/wd/hub',
    region: 'us',
    services: ['saucelabs'],
    specs: [
        './test/specs/**/*.js'
    ],
    maxInstances: 10,
    capabilities: [{
        platformName: 'iOS',
        'appium:app': 'storage:filename=<app_name>',
        'appium:deviceName': 'iPhone.*',
        'appium:automationName': 'XCUITest',
        'sauce:options': {
            resigningEnabled: true,
            appiumVersion: 'latest',
            build: 'iOS Regression Suite',
        },
    }],
};
```

## Sauce Labs RDC Advanced Functionality
- Use `sauce:options` in capabilities for advanced features (e.g., video recording, custom build names).
- Resigning must be set to true `resigningEnabled: true` for all advanced features to work.

### Audio Capture
The default value is false.
- Use capability `audioCapture: true` to enable audio capture.

### Biometric Authentication
- Use capability `biometricsInterception: true` to enable biometric interception.
- For iOS include `allowTouchIdEnroll: true` to allow Touch ID enrollment.
- To simulate a passing biometric authentication scenario use:
```javascript
driver.execute('sauce:biometrics-authenticate=true');
```
- To simulate a failing biometric authentication scenario use:
```javascript
driver.execute('sauce:biometrics-authenticate=false');
```

### Bypass Screenshot Restriction - Android Only
Bypasses the restriction on taking screenshots for secure screens.
- Use capability `bypassScreenshotRestriction: true` to enable crash reporting.

### Crash Reporting
Enables capturing and inclusion of detailed stack traces in the test results.
- Use capability `crashReporting: true` to enable crash reporting.

### Enable Animations - Android Only
Use this capability to enable animations for Android real devices by setting it to true. By default, animations are disabled.
- Use capability `enableAnimations: true` to enable animations.

### Group Folder Redirection
Enables the use of the app's private app container directory instead of the shared app group container directory. For testing on the Real Device Cloud, the app gets resigned, which is why the shared directory is not accessible.
- Use capability `groupFolderRedirectEnabled: true` to enable group folder redirection.

### Image Injection
Enables the camera image injection feature.
- Use capability `imageInjection: true` to enable image injection.

### Network Capture
Enables recording of HTTP/HTTPS network traffic for debugging purposes. The default value is false.
- Use capability `networkCapture: true` to enable network capture.

### Network Profile
Set a network profile with predefined network conditions at the beginning of the session.
- Use capability `networkProfile: <profile_name>` to set the desired network profile.
- Network profiles can be applied dynamically during a session by executing the following command:
```javascript
driver.execute('"sauce: network-profile"="<profile_name>"');
```
- Use the following to disable the feature dynamically during a session by executing the following command:
```javascript
driver.execute('"sauce: network-profile"="no-throttling"');
```

Available network profiles:
| Network Profile | ID | Download Speed (kbps) | Upload Speed (kbps) | Latency (ms) | Packet Loss (%) |
| --- | --- | --- | --- | --- | --- |
| No Throttling | no-throttling | - | - | - | - |
| No Network | no-network | 0 | 0 | 0 | 100 |
| 2G Packet Loss | 2G-packet-loss | 100 | 50 | 500 | 10 |
| 2G | 2G | 200 | 100 | 300 | 1 |
| 3G Slow | 3G-slow | 500 | 250 | 200 | 1 |
| 3G Fast | 3G-fast | 7000 | 2500 | 100 | - |
| 4G Slow | 4G-slow | 8000 | 4000 | 100 | - |
| 4G Fast | 4G-fast | 25000 | 15000 | 30 | - |

### System Alerts Delay - iOS Only
Delays system alerts, such as alerts asking for permission to access the camera, to prevent app crashes at startup.
- Use capability `systemAlertsDelayEnabled: true` to enable system alerts delay .

### Vitals
Vitals enables memory, cpu, performance stats alongside UI interactions during the session.
- Use capability `vitals: true` to enable vitals collection.