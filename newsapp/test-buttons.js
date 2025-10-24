const { chromium, devices } = require('playwright');

async function testButtons() {
    const iPhone = devices['iPhone 12'];
    const browser = await chromium.launch({
        headless: false,
        slowMo: 100
    });

    const context = await browser.newContext({
        ...iPhone,
        viewport: { width: 390, height: 844 }
    });

    const page = await context.newPage();

    console.log('🔗 Testing button functionality and positioning\n');

    await page.goto('https://f2e476cf9220.ngrok-free.app');

    // Handle ngrok warning page if it appears
    try {
        const visitButton = await page.waitForSelector('button:has-text("Visit Site")', { timeout: 3000 });
        if (visitButton) {
            console.log('✓ Clicking through ngrok warning...');
            await visitButton.click();
            await page.waitForTimeout(1000);
        }
    } catch (e) {
        // No warning page, continue
    }

    console.log('✓ Page loaded');

    // Wait for app to initialize
    await page.waitForSelector('#start-btn', { timeout: 5000 });

    // Select some interests
    await page.click('[data-topic="technology"]');
    await page.click('[data-topic="ai"]');
    await page.click('[data-topic="science"]');
    console.log('✓ Selected interests');

    // Click start
    await page.click('#start-btn');
    console.log('✓ Clicked Get Started');

    await page.waitForTimeout(2000);

    // Check button positions
    const buttonPositions = await page.evaluate(() => {
        const sideActions = document.getElementById('side-actions');
        const readBtn = document.querySelector('.read-btn');
        const sideActionsRect = sideActions.getBoundingClientRect();
        const readBtnRect = readBtn ? readBtn.getBoundingClientRect() : null;

        return {
            sideActions: {
                bottom: sideActionsRect.bottom,
                top: sideActionsRect.top,
                right: sideActionsRect.right
            },
            readBtn: readBtnRect ? {
                bottom: readBtnRect.bottom,
                top: readBtnRect.top
            } : null,
            windowHeight: window.innerHeight
        };
    });

    console.log('\n📐 Button Positioning:');
    console.log(`Window height: ${buttonPositions.windowHeight}px`);
    console.log(`Side actions top: ${buttonPositions.sideActions.top}px`);
    console.log(`Side actions bottom: ${buttonPositions.sideActions.bottom}px`);
    if (buttonPositions.readBtn) {
        console.log(`Read button top: ${buttonPositions.readBtn.top}px`);
        console.log(`Read button bottom: ${buttonPositions.readBtn.bottom}px`);
        const clearance = buttonPositions.readBtn.top - buttonPositions.sideActions.bottom;
        console.log(`Clearance between side actions and read button: ${clearance}px`);
        if (clearance > 0) {
            console.log('✓ Side actions are properly positioned above read button');
        } else {
            console.log('⚠️  Side actions may overlap with read button');
        }
    }

    // Test like button (heart)
    console.log('\n❤️  Testing Like Button...');

    // Get initial liked articles count
    const initialLikedCount = await page.evaluate(() => {
        return window.AppState.userPreferences.likedArticles.length;
    });
    console.log(`Initial liked articles: ${initialLikedCount}`);

    // Click like button
    await page.click('#like-action');
    console.log('✓ Clicked like button');

    await page.waitForTimeout(500);

    // Check if article was liked
    const newLikedCount = await page.evaluate(() => {
        return window.AppState.userPreferences.likedArticles.length;
    });
    console.log(`Liked articles after click: ${newLikedCount}`);

    if (newLikedCount > initialLikedCount) {
        console.log('✓ Like button works! Article was added to liked list');
    } else {
        console.log('❌ Like button may not be working - count did not increase');
    }

    // Test bookmark button
    console.log('\n🔖 Testing Bookmark Button...');
    const initialBookmarkCount = await page.evaluate(() => {
        return window.AppState.userPreferences.savedArticles.length;
    });
    console.log(`Initial bookmarked articles: ${initialBookmarkCount}`);

    await page.click('#bookmark-action');
    console.log('✓ Clicked bookmark button');
    await page.waitForTimeout(500);

    const newBookmarkCount = await page.evaluate(() => {
        return window.AppState.userPreferences.savedArticles.length;
    });
    console.log(`Bookmarked articles after click: ${newBookmarkCount}`);

    if (newBookmarkCount > initialBookmarkCount) {
        console.log('✓ Bookmark button works!');
    } else {
        console.log('❌ Bookmark button may not be working');
    }

    // Test dislike button
    console.log('\n👎 Testing Dislike Button...');
    const initialDislikedCount = await page.evaluate(() => {
        return window.AppState.userPreferences.dislikedArticles.length;
    });
    console.log(`Initial disliked articles: ${initialDislikedCount}`);

    await page.click('#dislike-action');
    console.log('✓ Clicked dislike button');
    await page.waitForTimeout(1000);

    const newDislikedCount = await page.evaluate(() => {
        return window.AppState.userPreferences.dislikedArticles.length;
    });
    console.log(`Disliked articles after click: ${newDislikedCount}`);

    if (newDislikedCount > initialDislikedCount) {
        console.log('✓ Dislike button works! Auto-scrolled to next article');
    } else {
        console.log('❌ Dislike button may not be working');
    }

    // Take screenshot
    await page.screenshot({ path: 'test-buttons.png', fullPage: false });
    console.log('\n✓ Screenshot saved: test-buttons.png');

    console.log('\n🎉 Button tests completed!');

    await page.waitForTimeout(3000);
    await browser.close();
}

testButtons().catch(console.error);
