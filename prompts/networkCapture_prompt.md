## Network Capture Test Suite Setup

This document describes how the Network Capture test suite was built and how to recreate it from scratch.

### Overview
The network capture suite validates the app's network capture functionality across all 8 network profiles defined in `reference/SAUCE-RDC.md`. Tests run in parallel on Sauce Labs with one worker per network profile.

### Files Created

#### 1. Page Object: `test/screens/NetworkCaptureScreen.js`
Implements the Page Object Model with:
- Getters for accessibility ID selectors: `send25GetRequestsButton`, `requestStatus`
- Async helper methods: `waitForScreen()`, `sendRequests()`, `waitForRequestStatus()`
- **Important**: Only includes selectors for elements that exist on the destination Network Capture screen, not home screen labels

Example structure:
```javascript
class NetworkCaptureScreen {
    get send25GetRequestsButton() {
        return $('~Send 25 GET Requests');
    }
    
    async waitForScreen() {
        await this.send25GetRequestsButton.waitForDisplayed({ timeout: 10000 });
        await this.requestStatus.waitForDisplayed({ timeout: 10000 });
    }
}
export default new NetworkCaptureScreen();
```

#### 2. Test Spec: `test/specs/networkCapture.spec.js`
Contains:
- Dynamic describe statement that includes active network profile: `describe(\`Test Network Capture - ${browser.capabilities['sauce:options']?.networkProfile || 'unknown'}\`, ...)`
- `before()` hook that navigates to the Network Capture screen
- Two test cases: profile validation and request execution
- Uses `browser.capabilities` to extract the active network profile

Example:
```javascript
let activeNetworkProfile = 'unknown';

describe(`Test Network Capture - ${browser.capabilities['sauce:options']?.networkProfile || 'unknown'}`, () => {
    before(async () => {
        const capabilities = browser.capabilities;
        activeNetworkProfile = capabilities['sauce:options']?.networkProfile;
        // Navigate and initialize...
    });
    
    it('should run with a valid network profile from SAUCE-RDC table', async () => {
        expect(NETWORK_PROFILES).toContain(activeNetworkProfile);
    });
});
```

#### 3. Parallel Config: `networkCapture.conf.js`
Standalone config file that:
- Maps all 8 network profiles from `reference/SAUCE-RDC.md` to individual capabilities
- Uses `networkProfiles.map()` to create one capability per profile
- Includes `networkCapture: true` in sauce:options for all capabilities
- Sets `name` in sauce:options to uniquely identify each profile job (e.g., `Network Capture - no-throttling`)
- Targets spec: `./test/specs/networkCapture.spec.js`

Example capabilities generation:
```javascript
const networkProfiles = [
    'no-throttling', 'no-network', '2G-packet-loss', '2G',
    '3G-slow', '3G-fast', '4G-slow', '4G-fast',
];

capabilities: networkProfiles.map((profile) => ({
    platformName: 'iOS',
    'appium:app': 'storage:filename=Features-18.ipa',
    'appium:deviceName': 'iPhone.*',
    'appium:automationName': 'XCUITest',
    'sauce:options': {
        resigningEnabled: true,
        networkCapture: true,
        networkProfile: profile,
        appiumVersion: 'latest',
        build: 'Agentic Testing - Network Profiles - ' + timestamp,
        name: `Network Capture - ${profile}`,
    },
})),
```

### How to Run
```bash
npx wdio run networkCapture.conf.js
```

This spawns 8 parallel workers on Sauce Labs, one for each network profile, and reports results with profile-specific naming.

### Key Implementation Notes
1. **Destination Screen Selectors**: The page object waits for elements on the actual Network Capture destination screen (Send 25 GET Requests, Request Status), not the home screen button, to avoid timeout failures.
2. **Dynamic Profile Naming**: The describe statement uses `browser.capabilities['sauce:options']?.networkProfile` to inject the profile name into test output, so each worker's tests are clearly labeled.
3. **Explicit Waits**: All interactions use `waitForDisplayed()` with 10-second timeouts, per SKILL.md requirements.
4. **Accessibility IDs**: All selectors use the `~` prefix (accessibility ID format).

### Recreating from Scratch
1. Follow SKILL.md for Page Object Model conventions
2. Create `test/screens/NetworkCaptureScreen.js` with getters and async action methods
3. Create `test/specs/networkCapture.spec.js` with dynamic describe statement referencing `browser.capabilities`
4. Create `networkCapture.conf.js` with mapped capabilities for each profile from `reference/SAUCE-RDC.md`
5. Ensure page object selectors target the destination screen, not navigation entry points
6. Run: `npx wdio run networkCapture.conf.js`