const { chromium } = require('playwright');

async function testArticleModalButtons() {
    console.log('🚀 Starting Article Modal Buttons Test...\n');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // Navigate to the app
        console.log('📱 Loading NewsBadger app...');
        await page.goto('http://localhost:8080/newsapp/index.html');

        // Wait for loading screen to finish
        await page.waitForSelector('#loading-screen', { state: 'hidden', timeout: 10000 });
        console.log('✅ Loading screen finished\n');

        // Check if onboarding or main app
        const onboardingVisible = await page.locator('#onboarding-screen.active').isVisible().catch(() => false);

        if (onboardingVisible) {
            console.log('📝 Onboarding screen detected, selecting interests...');
            await page.click('.chip[data-topic="technology"]');
            await page.click('.chip[data-topic="ai"]');
            await page.click('.chip[data-topic="science"]');
            await page.click('#start-btn');
            await page.waitForTimeout(1000);
            console.log('✅ Interests selected and app started\n');
        }

        // Wait for app screen and feed to load
        await page.waitForSelector('#app-screen.active', { timeout: 5000 });
        await page.waitForTimeout(2000); // Give feed time to render
        await page.waitForSelector('.tiktok-article', { timeout: 10000 });
        console.log('✅ Main app screen loaded\n');

        // Verify no buttons on main feed
        console.log('🔍 Checking that buttons are NOT on main feed...');
        const sideActionsOnFeed = await page.locator('#side-actions').count();
        console.log(`   Side actions on feed: ${sideActionsOnFeed === 0 ? 'Not present ✅' : 'Still present ❌'}\n`);

        // Click on first article to open modal
        console.log('📖 Opening article detail modal...');
        const firstReadBtn = page.locator('.read-btn').first();
        await firstReadBtn.click();
        await page.waitForTimeout(500);

        // Wait for modal to be visible
        await page.waitForSelector('#article-modal.active', { timeout: 3000 });
        console.log('✅ Article modal opened\n');

        // Take screenshot of modal with buttons
        await page.screenshot({ path: 'newsapp/test-modal-buttons-initial.png', fullPage: false });
        console.log('📸 Screenshot saved: test-modal-buttons-initial.png\n');

        // Check that buttons are visible in modal
        console.log('🔍 Checking button visibility in modal...');
        const articleActions = await page.locator('#article-actions');
        const isVisible = await articleActions.isVisible();
        console.log(`   Article actions visible: ${isVisible}`);

        // Get button positions
        const boundingBox = await articleActions.boundingBox();
        console.log(`   Position: top=${boundingBox.y}px, left=${boundingBox.x}px`);
        console.log(`   Size: ${boundingBox.width}px × ${boundingBox.height}px\n`);

        // Get article ID
        const articleId = await page.evaluate(() => {
            return window.AppState.currentModalArticle?.id;
        });
        console.log(`📰 Current modal article ID: ${articleId}\n`);

        // TEST 1: Bookmark Button
        console.log('🔖 TEST 1: Testing Bookmark Button in Modal...');
        const bookmarkBtn = page.locator('#article-bookmark-btn');

        // Dismiss any existing alerts
        page.on('dialog', async dialog => {
            console.log(`   Alert: ${dialog.message()}`);
            await dialog.accept();
        });

        await bookmarkBtn.click();
        await page.waitForTimeout(800);

        const savedArticles = await page.evaluate(() => {
            const prefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
            return prefs.savedArticles || [];
        });
        console.log(`   Saved articles count: ${savedArticles.length}`);
        const wasBookmarked = savedArticles.some(a => a.id == articleId);
        console.log(`   ✅ Bookmark test: ${wasBookmarked ? 'PASSED' : 'FAILED'}\n`);

        // TEST 2: Like Button
        console.log('❤️  TEST 2: Testing Like Button in Modal...');
        const likeBtn = page.locator('#article-like-btn');
        await likeBtn.click();
        await page.waitForTimeout(800);

        const likedArticles = await page.evaluate(() => {
            const prefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
            return prefs.likedArticles || [];
        });
        console.log(`   Liked articles count: ${likedArticles.length}`);
        const wasLiked = likedArticles.some(a => a.id == articleId);
        console.log(`   ✅ Like test: ${wasLiked ? 'PASSED' : 'FAILED'}\n`);

        // TEST 3: Dislike/Pass Button
        console.log('👎 TEST 3: Testing Dislike/Pass Button in Modal...');
        const dislikeBtn = page.locator('#article-dislike-btn');
        await dislikeBtn.click();
        await page.waitForTimeout(800);

        const dislikedArticles = await page.evaluate(() => {
            const prefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
            return prefs.dislikedArticles || [];
        });
        console.log(`   Disliked articles count: ${dislikedArticles.length}`);
        const wasDisliked = dislikedArticles.some(a => a.id == articleId);
        console.log(`   ✅ Dislike test: ${wasDisliked ? 'PASSED' : 'FAILED'}\n`);

        // Close modal and open another article for "Explore More" test
        console.log('🔄 Closing modal and opening another article...');
        await page.click('#close-article-btn');
        await page.waitForTimeout(500);

        // Scroll to second article and open it
        const secondReadBtn = page.locator('.read-btn').nth(1);
        await secondReadBtn.click();
        await page.waitForTimeout(500);
        await page.waitForSelector('#article-modal.active', { timeout: 3000 });
        console.log('✅ Second article modal opened\n');

        // TEST 4: Explore More Button
        console.log('🔍 TEST 4: Testing Explore More Button in Modal...');
        const moreBtn = page.locator('#article-more-btn');
        await moreBtn.click();
        await page.waitForTimeout(3000);

        // Check if modal closed and explore tab opened
        const modalClosed = !(await page.locator('#article-modal.active').isVisible().catch(() => false));
        console.log(`   Modal closed: ${modalClosed}`);

        // Check if switched to explore tab
        const exploreActive = await page.locator('.tab-btn[data-tab="explore"].active').isVisible();
        console.log(`   Explore tab active: ${exploreActive}`);

        // Check if AI analysis appeared
        const hasBanner = await page.locator('.ai-analysis-banner').count();
        console.log(`   AI analysis banner appeared: ${hasBanner > 0}`);
        console.log(`   ✅ Explore More test: ${modalClosed && exploreActive && hasBanner > 0 ? 'PASSED' : 'FAILED'}\n`);

        // Take final screenshot
        await page.screenshot({ path: 'newsapp/test-modal-buttons-final.png', fullPage: false });
        console.log('📸 Screenshot saved: test-modal-buttons-final.png\n');

        // Summary
        console.log('=' .repeat(50));
        console.log('📊 TEST SUMMARY:');
        console.log('=' .repeat(50));
        console.log(`📍 No buttons on feed:   ${sideActionsOnFeed === 0 ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`🔖 Modal Bookmark:       ${wasBookmarked ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`❤️  Modal Like:           ${wasLiked ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`👎 Modal Dislike/Pass:   ${wasDisliked ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`🔍 Modal Explore More:   ${modalClosed && exploreActive && hasBanner > 0 ? '✅ PASSED' : '❌ FAILED'}`);
        console.log('=' .repeat(50));

        // Keep browser open for inspection
        console.log('\n⏸️  Browser will stay open for 10 seconds for inspection...');
        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('❌ Error during test:', error);
        await page.screenshot({ path: 'newsapp/test-modal-error.png' });
    } finally {
        await browser.close();
        console.log('\n✅ Test complete!');
    }
}

testArticleModalButtons();
