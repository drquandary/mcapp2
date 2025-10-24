const { chromium } = require('playwright');

async function testEmptyFeed() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    const logs = [];
    page.on('console', msg => logs.push(msg.text()));

    await page.goto('http://localhost:8000/index.html');
    await page.waitForSelector('#start-btn');
    await page.click('#start-btn');
    console.log('Clicked start');

    await page.waitForTimeout(3000);

    // Check what's in the state
    const state = await page.evaluate(() => {
        return {
            articlesCount: AppState.articles.length,
            currentScreen: AppState.currentScreen,
            feedExists: !!document.getElementById('tiktok-feed'),
            feedHTML: document.getElementById('tiktok-feed') ? document.getElementById('tiktok-feed').innerHTML.substring(0, 100) : 'NO FEED',
            emptyStateDisplay: document.getElementById('empty-state').style.display,
            sideActionsDisplay: document.getElementById('side-actions').style.display
        };
    });

    console.log('\n--- State ---');
    console.log(JSON.stringify(state, null, 2));

    console.log('\n--- Recent Logs ---');
    logs.filter(l =>
        l.includes('articles') ||
        l.includes('render') ||
        l.includes('RSS') ||
        l.includes('Loaded') ||
        l.includes('screen')
    ).forEach(l => console.log(l));

    await page.screenshot({ path: 'empty-feed-debug.png' });
    console.log('\nScreenshot saved');

    await page.waitForTimeout(5000);
    await browser.close();
}

testEmptyFeed().catch(console.error);
