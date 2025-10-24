const { chromium } = require('playwright');

async function testCircleButtons() {
    console.log('🚀 Starting Circle Buttons Test...\n');

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
            // Select a few interests
            await page.click('.chip[data-topic="technology"]');
            await page.click('.chip[data-topic="ai"]');
            await page.click('.chip[data-topic="science"]');
            await page.click('#start-btn');
            await page.waitForTimeout(1000);
            console.log('✅ Interests selected and app started\n');
        }

        // Wait for app screen and feed to load
        await page.waitForSelector('#app-screen.active', { timeout: 5000 });
        await page.waitForSelector('.tiktok-article', { timeout: 5000 });
        console.log('✅ Main app screen loaded\n');

        // Check that side-actions buttons are visible
        console.log('🔍 Checking button visibility and positioning...');
        const sideActions = await page.locator('#side-actions');
        const isVisible = await sideActions.isVisible();
        console.log(`   Side actions visible: ${isVisible}`);

        // Get button positions
        const boundingBox = await sideActions.boundingBox();
        console.log(`   Position: top=${boundingBox.y}px, left=${boundingBox.x}px`);
        console.log(`   Size: ${boundingBox.width}px × ${boundingBox.height}px\n`);

        // Take screenshot of initial state
        await page.screenshot({ path: 'newsapp/test-buttons-initial.png', fullPage: false });
        console.log('📸 Screenshot saved: test-buttons-initial.png\n');

        // Get initial article ID
        const initialArticle = await page.locator('.tiktok-article').first();
        const initialArticleId = await initialArticle.getAttribute('data-article-id');
        console.log(`📰 Current article ID: ${initialArticleId}\n`);

        // TEST 1: Bookmark Button
        console.log('🔖 TEST 1: Testing Bookmark Button...');
        const bookmarkBtn = page.locator('#bookmark-action');
        await bookmarkBtn.click();
        await page.waitForTimeout(500);

        // Check if article was saved
        const savedArticles = await page.evaluate(() => {
            const prefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
            return prefs.savedArticles || [];
        });
        console.log(`   Saved articles count: ${savedArticles.length}`);
        const wasBookmarked = savedArticles.some(a => a.id == initialArticleId);
        console.log(`   ✅ Bookmark test: ${wasBookmarked ? 'PASSED' : 'FAILED'}\n`);

        // TEST 2: Like Button
        console.log('❤️  TEST 2: Testing Like Button...');
        const likeBtn = page.locator('#like-action');
        await likeBtn.click();
        await page.waitForTimeout(500);

        // Check if article was liked
        const likedArticles = await page.evaluate(() => {
            const prefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
            return prefs.likedArticles || [];
        });
        console.log(`   Liked articles count: ${likedArticles.length}`);
        const wasLiked = likedArticles.some(a => a.id == initialArticleId);
        console.log(`   ✅ Like test: ${wasLiked ? 'PASSED' : 'FAILED'}\n`);

        // Get new article after like action
        await page.waitForTimeout(500);
        const newArticle = await page.locator('.tiktok-article').first();
        const newArticleId = await newArticle.getAttribute('data-article-id');
        console.log(`📰 New article ID after like: ${newArticleId}\n`);

        // TEST 3: Dislike/Pass Button
        console.log('👎 TEST 3: Testing Dislike/Pass Button...');
        const dislikeBtn = page.locator('#dislike-action');

        // Get current scroll position
        const beforeScrollTop = await page.evaluate(() => {
            return document.getElementById('tiktok-feed').scrollTop;
        });

        await dislikeBtn.click();
        await page.waitForTimeout(1000);

        // Check if article was disliked
        const dislikedArticles = await page.evaluate(() => {
            const prefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
            return prefs.dislikedArticles || [];
        });
        console.log(`   Disliked articles count: ${dislikedArticles.length}`);
        const wasDisliked = dislikedArticles.some(a => a.id == newArticleId);

        // Check if scrolled to next article
        const afterScrollTop = await page.evaluate(() => {
            return document.getElementById('tiktok-feed').scrollTop;
        });
        const didScroll = afterScrollTop > beforeScrollTop;
        console.log(`   Scrolled to next: ${didScroll}`);
        console.log(`   ✅ Dislike test: ${wasDisliked && didScroll ? 'PASSED' : 'FAILED'}\n`);

        // TEST 4: Explore More Button (with AI)
        console.log('🔍 TEST 4: Testing Explore More Button...');
        const moreBtn = page.locator('#more-action');

        // Get current article count before exploration
        const beforeArticleCount = await page.locator('.tiktok-article').count();
        console.log(`   Articles before exploration: ${beforeArticleCount}`);

        await moreBtn.click();
        await page.waitForTimeout(3000); // Wait for AI analysis

        // Check if AI analysis banner appeared
        const hasBanner = await page.locator('.ai-analysis-banner').count();
        console.log(`   AI analysis banner appeared: ${hasBanner > 0}`);

        // Check if new articles were added
        const afterArticleCount = await page.locator('.tiktok-article').count();
        console.log(`   Articles after exploration: ${afterArticleCount}`);
        const addedArticles = afterArticleCount > beforeArticleCount;
        console.log(`   ✅ Explore More test: ${hasBanner > 0 ? 'PASSED' : 'FAILED'}\n`);

        // Take final screenshot
        await page.screenshot({ path: 'newsapp/test-buttons-final.png', fullPage: false });
        console.log('📸 Screenshot saved: test-buttons-final.png\n');

        // Summary
        console.log('=' .repeat(50));
        console.log('📊 TEST SUMMARY:');
        console.log('=' .repeat(50));
        console.log(`🔖 Bookmark:     ${wasBookmarked ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`❤️  Like:         ${wasLiked ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`👎 Dislike/Pass: ${wasDisliked && didScroll ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`🔍 Explore More: ${hasBanner > 0 ? '✅ PASSED' : '❌ FAILED'}`);
        console.log('=' .repeat(50));

        // Keep browser open for inspection
        console.log('\n⏸️  Browser will stay open for 10 seconds for inspection...');
        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('❌ Error during test:', error);
        await page.screenshot({ path: 'newsapp/test-error.png' });
    } finally {
        await browser.close();
        console.log('\n✅ Test complete!');
    }
}

testCircleButtons();
