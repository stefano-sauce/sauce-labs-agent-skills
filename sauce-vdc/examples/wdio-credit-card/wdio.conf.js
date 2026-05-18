const { execSync } = require('child_process');

exports.config = {
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    hostname: `ondemand.${process.env.SAUCE_REGION}.saucelabs.com`,
    port: 443,
    path: '/wd/hub',
    runner: 'local',
    specs: ['./test/**/*.test.js'],
    capabilities: [{
        browserName: 'firefox',
        browserVersion: 'latest',
        platformName: 'Windows 11',
        'wdio:enforceWebDriverClassic': true,
        'sauce:options': {
            build: 'credit-card-wdio-build',
            name: 'Credit Card Payment Flow - WebdriverIO',
        }
    }],
    services: [['sauce', { region: process.env.SAUCE_REGION }]],
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: { timeout: 60000 },

    afterTest: async function(_test, _ctx, { passed }) {
        const sessionId = browser.sessionId;
        const user = process.env.SAUCE_USERNAME;
        const key = process.env.SAUCE_ACCESS_KEY;
        const region = process.env.SAUCE_REGION;
        try {
            execSync(
                `curl -s -u "${user}:${key}" ` +
                `-X PUT "https://api.${region}.saucelabs.com/rest/v1/${user}/jobs/${sessionId}" ` +
                `-H "Content-Type: application/json" ` +
                `-d '{"passed":${passed}}'`
            );
        } catch (e) {
            console.warn('Could not update job status:', e.message);
        }
    }
};
