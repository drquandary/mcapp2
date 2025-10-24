const { chromium } = require('playwright');

async function testExplore() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    page.on('console', msg => console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text()));
    page.on('pageerror', error => console.error('[BROWSER ERROR]:', error.message));

    await page.goto('http://localhost:8000/index.html');

    // Wait and click Get Started
    await page.waitForSelector('#start-btn', { timeout: 5000 });
    await page.click('#start-btn');
    console.log('Clicked Get Started');

    await page.waitForTimeout(2000);

    // Click Explore tab
    await page.click('[data-tab="explore"]');
    console.log('Clicked Explore tab');

    await page.waitForTimeout(2000);

    // Check if list cards are rendered
    const listCardCount = await page.$$eval('.list-card', cards => cards.length);
    console.log(`\nFound ${listCardCount} list cards in Explore view`);

    // Check if buttons are present
    const hasReadBtn = await page.isVisible('.list-action-btn.read-btn');
    const hasMoreBtn = await page.isVisible('.list-action-btn.more-btn');
    console.log('Read button visible:', hasReadBtn);
    console.log('More button visible:', hasMoreBtn);

    // Take screenshot
    await page.screenshot({ path: 'explore-test.png', fullPage: true });
    console.log('\nScreenshot saved to explore-test.png');

    await page.waitForTimeout(30000);
    await browser.close();
}

testExplore().catch(console.error);
