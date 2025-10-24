const { chromium } = require('playwright');

async function testTikTok() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

    await page.goto('http://localhost:8000/index.html');
    await page.waitForSelector('#start-btn');
    await page.click('#start-btn');
    console.log('✓ Started app');

    await page.waitForTimeout(3000);

    const feedExists = await page.$('#tiktok-feed');
    console.log('✓ TikTok feed exists:', !!feedExists);

    const articleCount = await page.$$eval('.tiktok-article', articles => articles.length);
    console.log('✓ Articles in feed:', articleCount);

    const sideActionsVisible = await page.isVisible('#side-actions');
    console.log('✓ Side actions visible:', sideActionsVisible);

    // Scroll down
    console.log('\n--- Testing Scroll ---');
    await page.evaluate(() => {
        const feed = document.getElementById('tiktok-feed');
        feed.scrollTop = 400;
    });

    await page.waitForTimeout(1000);

    // Click like button
    console.log('\n--- Testing Like Button ---');
    await page.click('#like-action');
    console.log('✓ Clicked like');

    await page.waitForTimeout(500);

    // Click dislike button (should scroll to next)
    console.log('\n--- Testing Dislike Button ---');
    await page.click('#dislike-action');
    console.log('✓ Clicked dislike');

    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tiktok-feed-test.png' });
    console.log('\n✓ Screenshot saved');

    await page.waitForTimeout(10000);
    await browser.close();
}

testTikTok().catch(console.error);
