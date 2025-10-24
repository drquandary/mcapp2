const { chromium } = require('playwright');

async function testSwipe() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    page.on('console', msg => console.log(`[BROWSER]:`, msg.text()));
    page.on('pageerror', error => console.error('[ERROR]:', error.message));

    await page.goto('http://localhost:8000/index.html');

    // Wait and click Get Started
    await page.waitForSelector('#start-btn', { timeout: 5000 });
    await page.click('#start-btn');
    console.log('✓ Clicked Get Started');

    await page.waitForTimeout(2000);

    // Wait for cards to load
    await page.waitForSelector('.news-card', { timeout: 5000 });
    console.log('✓ Cards loaded');

    // Check if swipe indicators exist
    const indicatorCount = await page.$$eval('.swipe-hint', els => els.length);
    console.log(`✓ Found ${indicatorCount} swipe indicators`);

    // Get the card element
    const cardExists = await page.$('.news-card');
    console.log('✓ Card element exists:', !!cardExists);

    // Try to touch the card to see if events work
    console.log('\n--- Testing Touch Events ---');

    // Get card center
    const cardBox = await page.$eval('.news-card', el => {
        const rect = el.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: rect.width,
            height: rect.height
        };
    });

    console.log('Card position:', cardBox);

    // Simulate touch start
    await page.touchscreen.tap(cardBox.x, cardBox.y);
    await page.waitForTimeout(500);

    console.log('\n--- Trying swipe with touchscreen API ---');

    // Try a swipe gesture using touch events
    await page.evaluate((coords) => {
        const card = document.querySelector('.news-card');
        console.log('Card found in page:', !!card);

        if (card) {
            // Simulate touchstart
            const touchStart = new Touch({
                identifier: 1,
                target: card,
                clientX: coords.x,
                clientY: coords.y,
                radiusX: 2.5,
                radiusY: 2.5,
                rotationAngle: 0,
                force: 1
            });

            const touchStartEvent = new TouchEvent('touchstart', {
                cancelable: true,
                bubbles: true,
                touches: [touchStart],
                targetTouches: [touchStart],
                changedTouches: [touchStart]
            });

            card.dispatchEvent(touchStartEvent);
            console.log('Dispatched touchstart');

            // Check if swiping class was added
            setTimeout(() => {
                console.log('Card has swiping class:', card.classList.contains('swiping'));

                // Simulate touchmove
                const touchMove = new Touch({
                    identifier: 1,
                    target: card,
                    clientX: coords.x + 150,
                    clientY: coords.y,
                    radiusX: 2.5,
                    radiusY: 2.5,
                    rotationAngle: 0,
                    force: 1
                });

                const touchMoveEvent = new TouchEvent('touchmove', {
                    cancelable: true,
                    bubbles: true,
                    touches: [touchMove],
                    targetTouches: [touchMove],
                    changedTouches: [touchMove]
                });

                document.dispatchEvent(touchMoveEvent);
                console.log('Dispatched touchmove to x:', coords.x + 150);

                // Check indicator opacity
                const rightHint = card.querySelector('.swipe-hint-right');
                if (rightHint) {
                    console.log('Right hint opacity:', window.getComputedStyle(rightHint).opacity);
                }

                setTimeout(() => {
                    // Simulate touchend
                    const touchEnd = new Touch({
                        identifier: 1,
                        target: card,
                        clientX: coords.x + 150,
                        clientY: coords.y,
                        radiusX: 2.5,
                        radiusY: 2.5,
                        rotationAngle: 0,
                        force: 1
                    });

                    const touchEndEvent = new TouchEvent('touchend', {
                        cancelable: true,
                        bubbles: true,
                        touches: [],
                        targetTouches: [],
                        changedTouches: [touchEnd]
                    });

                    document.dispatchEvent(touchEndEvent);
                    console.log('Dispatched touchend');
                }, 100);
            }, 100);
        }
    }, cardBox);

    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({ path: 'swipe-debug.png', fullPage: true });
    console.log('\n✓ Screenshot saved to swipe-debug.png');

    await page.waitForTimeout(10000);
    await browser.close();
}

testSwipe().catch(console.error);
