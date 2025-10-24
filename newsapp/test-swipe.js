const { chromium } = require('playwright');

async function testSwipe() {
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

    // Wait for cards to load
    await page.waitForSelector('.news-card', { timeout: 5000 });
    console.log('Cards loaded');

    // Check for swipe indicators
    const hasSwipeIndicators = await page.$$eval('.swipe-hint', hints => hints.length);
    console.log(`Found ${hasSwipeIndicators} swipe hint elements`);

    // Get card position
    const cardBounds = await page.$eval('.news-card', card => {
        const rect = card.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });
    console.log('Card bounds:', cardBounds);

    // Test swipe right (like)
    console.log('\n--- Testing Swipe Right (Like) ---');
    const centerX = cardBounds.x + cardBounds.width / 2;
    const centerY = cardBounds.y + cardBounds.height / 2;

    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.waitForTimeout(100);

    // Swipe right
    await page.mouse.move(centerX + 200, centerY, { steps: 10 });
    await page.waitForTimeout(100);

    // Check if indicator is visible during swipe
    const rightIndicatorOpacity = await page.$eval('.swipe-hint-right', el =>
        window.getComputedStyle(el).opacity
    );
    console.log('Right indicator opacity during swipe:', rightIndicatorOpacity);

    await page.mouse.up();
    await page.waitForTimeout(1000);

    // Check if undo button appears
    const undoVisible = await page.isVisible('#undo-btn');
    console.log('Undo button visible after swipe:', undoVisible);

    // Test undo
    if (undoVisible) {
        console.log('\n--- Testing Undo ---');
        await page.click('#undo-btn');
        await page.waitForTimeout(1000);

        const undoStillVisible = await page.isVisible('#undo-btn');
        console.log('Undo button hidden after undo:', !undoStillVisible);
    }

    await page.waitForTimeout(2000);

    // Test swipe left (dislike)
    console.log('\n--- Testing Swipe Left (Dislike) ---');
    const cardBounds2 = await page.$eval('.news-card', card => {
        const rect = card.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    const centerX2 = cardBounds2.x + cardBounds2.width / 2;
    const centerY2 = cardBounds2.y + cardBounds2.height / 2;

    await page.mouse.move(centerX2, centerY2);
    await page.mouse.down();
    await page.waitForTimeout(100);

    // Swipe left
    await page.mouse.move(centerX2 - 200, centerY2, { steps: 10 });
    await page.waitForTimeout(100);

    // Check if indicator is visible during swipe
    const leftIndicatorOpacity = await page.$eval('.swipe-hint-left', el =>
        window.getComputedStyle(el).opacity
    );
    console.log('Left indicator opacity during swipe:', leftIndicatorOpacity);

    await page.mouse.up();
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({ path: 'swipe-test.png', fullPage: true });
    console.log('\nScreenshot saved to swipe-test.png');

    await page.waitForTimeout(5000);
    await browser.close();
}

testSwipe().catch(console.error);
