const { chromium } = require('playwright');

async function testApp() {
    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Listen to console messages
    page.on('console', msg => {
        const type = msg.type();
        console.log(`[BROWSER ${type.toUpperCase()}]:`, msg.text());
    });

    // Listen to page errors
    page.on('pageerror', error => {
        console.error('[BROWSER ERROR]:', error.message);
        console.error(error.stack);
    });

    // Navigate to the app
    console.log('Navigating to http://localhost:8000/index.html...');
    await page.goto('http://localhost:8000/index.html');

    // Wait a bit to let things load
    await page.waitForTimeout(3000);

    // Check what's visible
    const loadingVisible = await page.isVisible('#loading-screen');
    const onboardingVisible = await page.isVisible('#onboarding-screen');
    const appVisible = await page.isVisible('#app-screen');

    console.log('\n=== Screen Visibility ===');
    console.log('Loading screen visible:', loadingVisible);
    console.log('Onboarding screen visible:', onboardingVisible);
    console.log('App screen visible:', appVisible);

    // Get computed styles
    const loadingDisplay = await page.$eval('#loading-screen', el =>
        window.getComputedStyle(el).display
    );
    const onboardingDisplay = await page.$eval('#onboarding-screen', el =>
        window.getComputedStyle(el).display
    );

    console.log('\n=== Computed Styles ===');
    console.log('Loading screen display:', loadingDisplay);
    console.log('Onboarding screen display:', onboardingDisplay);

    // Take a screenshot
    await page.screenshot({ path: 'screenshot.png', fullPage: true });
    console.log('\nScreenshot saved to screenshot.png');

    // Check if body has content
    const bodyHTML = await page.evaluate(() => document.body.innerHTML.length);
    console.log('Body HTML length:', bodyHTML);

    // Wait for user to inspect
    console.log('\nBrowser will stay open for 5 seconds for inspection...');
    await page.waitForTimeout(5000);

    await browser.close();
}

testApp().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
