const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false, slowMo: 500 });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Listen to console logs
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('Full Coverage') || text.includes('MATCHED') || text.includes('related articles')) {
            console.log('BROWSER:', text);
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
            await page.click('.chip[data-topic="technology"]');
            await page.click('.chip[data-topic="business"]');
            await page.click('.chip[data-topic="politics"]');
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

        // Take screenshot before clicking
        await page.screenshot({ path: 'newsapp/test-full-coverage-before.png', fullPage: true });
        console.log('📸 Screenshot saved: test-full-coverage-before.png');

        // Click on the first article's "More" button
        console.log('🔍 Looking for "Find more like this" button...');
        const moreButton = page.locator('.list-card .more-btn').first();

        if (await moreButton.isVisible()) {
            // Get the article title first
            const firstCard = page.locator('.list-card').first();
            const articleTitle = await firstCard.locator('h3').textContent();
            console.log(`\n✅ Found article: "${articleTitle}"`);
            console.log('🔍 Clicking "Find more like this" button...');

            await moreButton.click();

            // Wait for the search to complete
            console.log('⏳ Waiting for Full Coverage to load...');
            await page.waitForTimeout(10000);

            // Check if Full Coverage banner appears
            const fullCoverageBanner = await page.locator('.ai-analysis-banner:has-text("Full Coverage")').isVisible().catch(() => false);

            if (fullCoverageBanner) {
                console.log('✅ Full Coverage mode activated!');

                // Get the banner text
                const banner = page.locator('.ai-analysis-banner').first();
                const bannerText = await banner.textContent();
                console.log('\n📊 Full Coverage Info:');
                console.log(bannerText.substring(0, 300) + '...');

                // Count articles now
                const articlesInCoverage = await page.locator('.list-card').count();
                console.log(`\n📰 Articles shown in Full Coverage: ${articlesInCoverage}`);

                // Check if exit button exists
                const exitButton = await page.locator('#exit-full-coverage-btn').isVisible();
                console.log(`✓ Exit button visible: ${exitButton}`);

                // Take screenshot
                await page.screenshot({ path: 'newsapp/test-full-coverage-active.png', fullPage: true });
                console.log('📸 Screenshot saved: test-full-coverage-active.png');

                // Wait a bit to see the results
                await page.waitForTimeout(3000);

                // Test the exit button
                if (exitButton) {
                    console.log('\n🚪 Testing exit button...');
                    await page.click('#exit-full-coverage-btn');
                    await page.waitForTimeout(2000);

                    // Check if we're back to normal view
                    const stillInCoverage = await page.locator('.ai-analysis-banner:has-text("Full Coverage")').isVisible().catch(() => false);

                    if (!stillInCoverage) {
                        console.log('✅ Successfully exited Full Coverage mode!');
                        const articlesAfterExit = await page.locator('.list-card').count();
                        console.log(`📰 Articles after exit: ${articlesAfterExit}`);
                    } else {
                        console.log('❌ Still in Full Coverage mode after clicking exit');
                    }

                    await page.screenshot({ path: 'newsapp/test-full-coverage-after-exit.png', fullPage: true });
                    console.log('📸 Screenshot saved: test-full-coverage-after-exit.png');
                }

            } else {
                console.log('❌ Full Coverage mode did NOT activate');

                // Check for error messages
                const noResults = await page.locator('text=No matching articles found').isVisible().catch(() => false);
                if (noResults) {
                    console.log('⚠️ No matching articles found');
                }

                await page.screenshot({ path: 'newsapp/test-full-coverage-failed.png', fullPage: true });
                console.log('📸 Screenshot saved: test-full-coverage-failed.png');
            }

        } else {
            console.log('❌ Could not find "Find more" button');
            await page.screenshot({ path: 'newsapp/test-no-more-button.png', fullPage: true });
        }

        console.log('\n⏸️  Keeping browser open for 20 seconds for manual inspection...');
        await page.waitForTimeout(20000);

    } catch (error) {
        console.error('❌ Test error:', error);
        await page.screenshot({ path: 'newsapp/test-error.png', fullPage: true });
    } finally {
        await browser.close();
    }
})();
