const { chromium, devices } = require('playwright');

async function testMoreButton() {
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

    console.log('🔗 Testing More button functionality\n');

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
    console.log('✓ Onboarding screen visible');

    // Select some interests
    await page.click('[data-topic="technology"]');
    await page.click('[data-topic="ai"]');
    await page.click('[data-topic="science"]');
    console.log('✓ Selected interests');

    // Click start
    await page.click('#start-btn');
    console.log('✓ Clicked Get Started');

    await page.waitForTimeout(2000);

    // Check feed
    const articleCount = await page.$$eval('.tiktok-article', articles => articles.length);
    console.log(`✓ Articles rendered: ${articleCount}`);

    // Check if more button is visible
    const moreButtonVisible = await page.isVisible('#more-action');
    console.log(`✓ More button visible: ${moreButtonVisible}`);

    if (!moreButtonVisible) {
        console.error('❌ More button not found!');
        await browser.close();
        return;
    }

    // Get current article info
    const currentArticleTitle = await page.evaluate(() => {
        const feed = document.getElementById('tiktok-feed');
        const firstArticle = feed.querySelector('.tiktok-article');
        const titleEl = firstArticle ? firstArticle.querySelector('.card-title') : null;
        return titleEl ? titleEl.textContent : 'Unknown';
    });
    console.log(`\n📰 Current article: "${currentArticleTitle}"`);

    // Click the More button
    console.log('\n🔍 Testing More button...');
    await page.click('#more-action');
    console.log('✓ Clicked More button');

    // Wait for loading banner to appear
    await page.waitForTimeout(1000);

    // Check if loading banner appeared
    const loadingBannerVisible = await page.isVisible('.ai-analysis-banner.loading');
    console.log(`✓ Loading banner appeared: ${loadingBannerVisible}`);

    // Wait for AI analysis to complete (up to 10 seconds)
    console.log('⏳ Waiting for AI analysis...');
    await page.waitForTimeout(8000);

    // Check if analysis banner appeared
    const analysisBannerVisible = await page.isVisible('.ai-analysis-banner');
    console.log(`✓ Analysis banner visible: ${analysisBannerVisible}`);

    if (analysisBannerVisible) {
        // Get analysis results
        const analysisText = await page.evaluate(() => {
            const banner = document.querySelector('.ai-analysis-banner');
            return banner ? banner.textContent : '';
        });
        console.log('\n📊 AI Analysis Results:');
        console.log(analysisText.substring(0, 300) + '...');

        // Count how many new articles were added
        const newArticleCount = await page.$$eval('.tiktok-article', articles => articles.length);
        console.log(`\n✓ Total articles after exploration: ${newArticleCount}`);
        console.log(`✓ New articles added: ${newArticleCount - articleCount}`);
    }

    // Take screenshot
    await page.screenshot({ path: 'test-more-button.png', fullPage: false });
    console.log('\n✓ Screenshot saved: test-more-button.png');

    console.log('\n🎉 Test completed!');

    await page.waitForTimeout(3000);
    await browser.close();
}

testMoreButton().catch(console.error);
