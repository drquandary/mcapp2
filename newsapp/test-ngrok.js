const { chromium } = require('playwright');

async function testNgrokConnection() {
    console.log('Testing Ngrok Connection...\n');

    const response = await fetch('http://localhost:4040/api/tunnels');
    const data = await response.json();
    const ngrokUrl = data.tunnels[0].public_url;

    console.log('Ngrok URL:', ngrokUrl);
    console.log('Full App URL:', ngrokUrl + '/newsapp/index.html\n');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('Loading app via ngrok...');
        await page.goto(ngrokUrl + '/newsapp/index.html', { waitUntil: 'networkidle' });

        const ngrokWarning = await page.locator('text=ngrok').count();
        if (ngrokWarning > 0) {
            console.log('Ngrok warning page detected, clicking Visit Site...');
            await page.click('button:has-text("Visit Site")').catch(() => {});
            await page.waitForTimeout(2000);
        }

        await page.waitForSelector('#loading-screen', { state: 'hidden', timeout: 15000 });
        console.log('Loading screen finished\n');

        const onboardingVisible = await page.locator('#onboarding-screen.active').isVisible().catch(() => false);

        if (onboardingVisible) {
            console.log('Onboarding screen detected');
            await page.screenshot({ path: 'newsapp/ngrok-onboarding.png' });
            console.log('App loaded successfully via ngrok!\n');
        } else {
            console.log('Main app screen detected');
            await page.screenshot({ path: 'newsapp/ngrok-main-app.png' });
            console.log('App loaded successfully via ngrok!\n');
        }

        const readBtn = await page.locator('.read-btn').first().isVisible().catch(() => false);
        if (readBtn) {
            console.log('Testing article modal...');
            await page.locator('.read-btn').first().click();
            await page.waitForTimeout(1000);

            const modalVisible = await page.locator('#article-modal.active').isVisible().catch(() => false);
            console.log('  Modal opened:', modalVisible ? 'YES' : 'NO');

            if (modalVisible) {
                const buttonsVisible = await page.locator('#article-actions').isVisible();
                console.log('  Action buttons visible:', buttonsVisible ? 'YES' : 'NO');

                await page.screenshot({ path: 'newsapp/ngrok-article-modal.png' });
                console.log('  Screenshot saved: ngrok-article-modal.png\n');
            }
        }

        console.log('============================================================');
        console.log('NGROK CONNECTION TEST PASSED!');
        console.log('============================================================');
        console.log('\nShare this URL to access your app from anywhere:');
        console.log('  ' + ngrokUrl + '/newsapp/index.html\n');

        console.log('Browser will stay open for 15 seconds...');
        await page.waitForTimeout(15000);

    } catch (error) {
        console.error('Error during test:', error);
        await page.screenshot({ path: 'newsapp/ngrok-error.png' });
        console.log('\nError screenshot saved: ngrok-error.png');
    } finally {
        await browser.close();
        console.log('\nTest complete!');
    }
}

testNgrokConnection();
