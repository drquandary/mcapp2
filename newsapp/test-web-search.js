const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false, slowMo: 1000 });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Listen to console logs
    page.on('console', msg => {
        console.log('BROWSER:', msg.text());
    });

    // Listen to network requests
    page.on('request', request => {
        const url = request.url();
        if (url.includes('newsapi.org') || url.includes('localhost:8081')) {
            console.log('🌐 REQUEST:', request.method(), url);
        }
    });

    page.on('response', response => {
        const url = response.url();
        if (url.includes('newsapi.org') || url.includes('localhost:8081')) {
            console.log('✅ RESPONSE:', response.status(), url);
        }
    });

    try {
        // Navigate to the app
        console.log('📱 Opening NewsBadger app...');
        await page.goto('file://' + __dirname + '/index.html');

        // Wait for the page to load
        await page.waitForTimeout(2000);

        // Check if we're on onboarding or main app
        const onboardingVisible = await page.locator('#onboarding-screen.active').isVisible().catch(() => false);

        if (onboardingVisible) {
            console.log('🎯 On onboarding screen, selecting interests and starting...');
            // Select a few interests
            await page.click('.chip[data-topic="technology"]');
            await page.click('.chip[data-topic="ai"]');
            await page.click('.chip[data-topic="science"]');
            await page.click('#start-btn');
            await page.waitForTimeout(3000);
        }

        console.log('✅ App loaded');

        // Switch to Explore view
        console.log('📋 Switching to Explore view...');
        await page.click('button[data-tab="explore"]');
        await page.waitForTimeout(2000);

        // Check if there are articles
        const articleCards = await page.locator('.list-card').count();
        console.log(`📰 Found ${articleCards} articles in Explore view`);

        if (articleCards === 0) {
            console.log('❌ No articles found! Trying to reload feed...');
            await page.click('#reload-feed-btn');
            await page.waitForTimeout(5000);
        }

        // Click on the first article's "More" button
        console.log('🔍 Looking for "Find more like this" button...');
        const moreButton = page.locator('.list-card .more-btn').first();

        if (await moreButton.isVisible()) {
            console.log('✅ Found "Find more" button, clicking it...');
            await moreButton.click();

            // Wait for the search to complete
            console.log('⏳ Waiting for web search to complete...');
            await page.waitForTimeout(8000);

            // Check if we got results
            const resultCards = await page.locator('.list-card').count();
            console.log(`📊 Total articles after search: ${resultCards}`);

            // Check for the AI analysis banner
            const banner = await page.locator('.ai-analysis-banner').first();
            if (await banner.isVisible()) {
                const bannerText = await banner.textContent();
                console.log('📊 Analysis banner:', bannerText.substring(0, 200));
            }

            // Check if "no results" message appears
            const noResults = await page.locator('text=No matching articles found').isVisible().catch(() => false);
            if (noResults) {
                console.log('❌ TEST FAILED: Still showing "no matching articles found"');
                console.log('🔍 Let me check what happened...');

                // Take a screenshot
                await page.screenshot({ path: 'newsapp/test-web-search-failed.png', fullPage: true });
                console.log('📸 Screenshot saved to test-web-search-failed.png');
            } else {
                console.log('✅ TEST PASSED: Articles found!');
                await page.screenshot({ path: 'newsapp/test-web-search-success.png', fullPage: true });
                console.log('📸 Screenshot saved to test-web-search-success.png');
            }

        } else {
            console.log('❌ Could not find "Find more" button');
            await page.screenshot({ path: 'newsapp/test-no-more-button.png', fullPage: true });
        }

        console.log('\n⏸️  Keeping browser open for 30 seconds for manual inspection...');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('❌ Test error:', error);
        await page.screenshot({ path: 'newsapp/test-error.png', fullPage: true });
    } finally {
        await browser.close();
    }
})();
