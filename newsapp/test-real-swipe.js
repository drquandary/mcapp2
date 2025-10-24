const { chromium, devices } = require('playwright');

async function testRealSwipe() {
    const iPhone = devices['iPhone 12'];
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        ...iPhone,
        viewport: { width: 390, height: 844 }
    });

    const page = await context.newPage();

    page.on('console', msg => console.log(`[BROWSER]:`, msg.text()));

    await page.goto('http://localhost:8000/index.html');
    await page.waitForSelector('#start-btn');
    await page.click('#start-btn');
    console.log('✓ Started app');

    await page.waitForTimeout(2000);
    await page.waitForSelector('.news-card');
    console.log('✓ Card loaded');

    // Get card position
    const card = await page.$('.news-card');
    const box = await card.boundingBox();

    console.log('\\n--- Simulating Right Swipe (Like) ---');

    // Start touch in middle of card
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    console.log(`Touch start at (${Math.round(startX)}, ${Math.round(startY)})`);

    // Perform swipe gesture
    await page.touchscreen.tap(startX, startY);
    await page.waitForTimeout(100);

    // Swipe right
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.waitForTimeout(50);

    // Move in steps
    for (let i = 0; i <= 10; i++) {
        const x = startX + (i * 20);  // Move 200px total
        await page.mouse.move(x, startY);
        await page.waitForTimeout(20);
    }

    await page.waitForTimeout(200);

    // Check indicator during swipe
    const indicatorOpacity = await page.$eval('.swipe-hint-right', el =>
        window.getComputedStyle(el).opacity
    ).catch(() => '0');
    console.log('Right indicator opacity during swipe:', indicatorOpacity);

    await page.mouse.up();
    console.log('Released swipe');

    await page.waitForTimeout(1000);

    // Check if undo button appeared
    const undoVisible = await page.isVisible('#undo-btn').catch(() => false);
    console.log('Undo button visible:', undoVisible);

    // Take screenshot
    await page.screenshot({ path: 'real-swipe-test.png', fullPage: true });
    console.log('\\n✓ Screenshot saved');

    await page.waitForTimeout(5000);
    await browser.close();
}

testRealSwipe().catch(console.error);
