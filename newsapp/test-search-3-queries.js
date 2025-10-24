const { chromium } = require('playwright');

(async () => {
    console.log('=== TESTING 3 REAL SEARCHES ===\n');

    const browser = await chromium.launch({ headless: false, slowMo: 500 });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Collect console logs
    const logs = [];
    page.on('console', msg => {
        const text = msg.text();
        logs.push(text);
        if (text.includes('Searching Google News') ||
            text.includes('Parsed') ||
            text.includes('Found') ||
            text.includes('MATCHED') ||
            text.includes('Total articles')) {
            console.log('BROWSER:', text);
        }
    });

    try {
        await page.goto('http://localhost:8080/index.html');
        await page.waitForTimeout(2000);

        const onboardingVisible = await page.locator('#onboarding-screen.active').isVisible().catch(() => false);
        if (onboardingVisible) {
            await page.click('.chip[data-topic="technology"]');
            await page.click('.chip[data-topic="business"]');
            await page.click('.chip[data-topic="science"]');
            await page.click('#start-btn');
            await page.waitForTimeout(3000);
        }

        // Switch to Explore
        await page.click('button[data-tab="explore"]');
        await page.waitForTimeout(2000);

        const testArticles = [
            { name: 'Data Centers', index: 0 },
            { name: 'Climate/Science', index: 1 },
            { name: 'Business/Tech', index: 2 }
        ];

        for (let i = 0; i < 3; i++) {
            const test = testArticles[i];
            console.log(`\n\n${'='.repeat(60)}`);
            console.log(`TEST ${i + 1}: ${test.name}`);
            console.log('='.repeat(60));

            // Switch back to Explore to get articles
            await page.click('button[data-tab="explore"]');
            await page.waitForTimeout(1000);

            const articleCards = await page.locator('.list-card').count();
            console.log(`Articles in Explore: ${articleCards}`);

            if (articleCards === 0) {
                console.log('❌ No articles found in Explore!');
                continue;
            }

            // Get article title
            const card = page.locator('.list-card').nth(test.index);
            const articleTitle = await card.locator('h3').textContent().catch(() => 'Unknown');
            console.log(`\nArticle: "${articleTitle.substring(0, 80)}..."`);

            // Click the + button
            const moreBtn = card.locator('.more-btn');
            if (await moreBtn.isVisible()) {
                console.log('\n🔍 Clicking "Find more like this"...');
                await moreBtn.click();

                // Wait for search to complete
                await page.waitForTimeout(10000);

                // Check if we're in Search tab
                const searchTabActive = await page.locator('button[data-tab="search"].active').isVisible().catch(() => false);
                console.log(`\nSwitched to Search tab: ${searchTabActive ? '✅' : '❌'}`);

                // Check results
                const searchFeed = page.locator('#search-feed');
                const banner = searchFeed.locator('.ai-analysis-banner').first();

                if (await banner.isVisible()) {
                    const bannerText = await banner.textContent();

                    if (bannerText.includes('Full Coverage')) {
                        // Found results!
                        const resultsMatch = bannerText.match(/Showing (\d+) related/);
                        const numResults = resultsMatch ? resultsMatch[1] : '?';
                        console.log(`\n✅ SUCCESS: Found ${numResults} related articles`);

                        // Count actual cards
                        const resultCards = await searchFeed.locator('.list-card').count();
                        console.log(`   Articles displayed: ${resultCards}`);

                        // Check if tags are shown
                        const firstCard = searchFeed.locator('.list-card').first();
                        const badges = await firstCard.locator('.source-badge').count();
                        console.log(`   Matching tags shown: ${badges > 0 ? '✅' : '❌'}`);

                    } else if (bannerText.includes('No matching articles')) {
                        console.log(`\n❌ FAILED: No matching articles found`);

                        // Extract what was searched
                        const searchingMatch = bannerText.match(/Searching for: "(.+?)"/);
                        if (searchingMatch) {
                            console.log(`   Searched for: "${searchingMatch[1]}"`);
                        }

                        // Check how many were checked
                        const checkedMatch = bannerText.match(/checked (\d+) articles/);
                        if (checkedMatch) {
                            console.log(`   Total articles checked: ${checkedMatch[1]}`);
                        }
                    }

                    // Take screenshot
                    await page.screenshot({
                        path: `newsapp/test-search-${i + 1}.png`,
                        fullPage: true
                    });
                    console.log(`   Screenshot: test-search-${i + 1}.png`);
                }

                // Check logs for Google News results
                const googleNewsLogs = logs.filter(l =>
                    l.includes('Parsed') && l.includes('items from Google News')
                );
                if (googleNewsLogs.length > 0) {
                    console.log(`   ${googleNewsLogs[googleNewsLogs.length - 1]}`);
                }

                const foundLogs = logs.filter(l =>
                    l.includes('Found') && l.includes('articles from Google News')
                );
                if (foundLogs.length > 0) {
                    console.log(`   ${foundLogs[foundLogs.length - 1]}`);
                }

            } else {
                console.log('❌ Could not find + button');
            }

            await page.waitForTimeout(2000);
        }

        console.log('\n\n' + '='.repeat(60));
        console.log('ALL TESTS COMPLETE');
        console.log('='.repeat(60));

        await page.waitForTimeout(5000);

    } catch (error) {
        console.error('❌ Test error:', error);
        await page.screenshot({ path: 'newsapp/test-search-error.png', fullPage: true });
    } finally {
        await browser.close();
    }
})();
