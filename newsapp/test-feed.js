const { chromium } = require('playwright');

async function testFeed() {
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

    // Check card dimensions
    const cardInfo = await page.evaluate(() => {
        const card = document.querySelector('.news-card');
        if (!card) return { error: 'No card found' };

        const rect = card.getBoundingClientRect();
        const styles = window.getComputedStyle(card);
        const content = card.querySelector('.card-content');
        const contentStyles = content ? window.getComputedStyle(content) : null;

        return {
            cardHeight: rect.height,
            cardMaxHeight: styles.maxHeight,
            cardOverflowY: styles.overflowY,
            contentHeight: content ? content.getBoundingClientRect().height : 0,
            contentOverflowY: contentStyles ? contentStyles.overflowY : 'N/A',
            viewportHeight: window.innerHeight
        };
    });

    console.log('\n=== Card Info ===');
    console.log(cardInfo);

    // Try clicking read more button
    const readButtonExists = await page.isVisible('.read-more-btn');
    console.log('\nRead more button visible:', readButtonExists);

    if (readButtonExists) {
        console.log('Clicking read more button...');
        await page.click('.read-more-btn');
        await page.waitForTimeout(1000);

        const modalVisible = await page.isVisible('#article-modal.active');
        console.log('Article modal opened:', modalVisible);
    }

    await page.screenshot({ path: 'feed-test.png', fullPage: true });
    console.log('\nScreenshot saved to feed-test.png');

    await page.waitForTimeout(30000);
    await browser.close();
}

testFeed().catch(console.error);
