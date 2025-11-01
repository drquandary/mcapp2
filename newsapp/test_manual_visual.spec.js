/**
 * VISUAL Manual Test - Run with headed browser to see what happens
 * Command: npx playwright test test_manual_visual.spec.js --headed --project=chromium
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

const APP_URL = `file://${path.resolve(__dirname, 'index.html')}`;

test('MANUAL VISUAL TEST: Watch + button behavior', async ({ page }) => {
    console.log('\n🔍 VISUAL TEST - Opening app...\n');

    await page.goto(APP_URL);

    // Complete survey
    console.log('1. Completing survey...');
    await page.waitForSelector('.truth-survey', { timeout: 5000 });
    await page.click('#start-btn');
    await page.waitForSelector('#feed-view', { timeout: 5000 });
    console.log('   ✓ Survey completed, on Feed tab\n');

    // Go to Search tab
    console.log('2. Going to Search tab...');
    await page.click('button[data-tab="search"]');
    await page.waitForSelector('#search-view.active', { timeout: 5000 });
    console.log('   ✓ On Search tab\n');

    // Perform search
    console.log('3. Searching for "AI news"...');
    await page.fill('#web-search-input', 'AI news');
    await page.click('#web-search-btn');

    // Wait for results
    await page.waitForSelector('.list-card', { timeout: 15000 });
    const resultCount = await page.locator('.list-card').count();
    console.log(`   ✓ Got ${resultCount} search results\n`);

    // Take screenshot before clicking
    await page.screenshot({ path: 'test-results/before-click.png', fullPage: true });
    console.log('   📸 Screenshot saved: before-click.png\n');

    // Check for + buttons
    const moreButtons = await page.locator('.list-card .more-btn');
    const buttonCount = await moreButtons.count();
    console.log(`4. Found ${buttonCount} + buttons`);

    if (buttonCount === 0) {
        console.log('   ❌ NO + BUTTONS FOUND!\n');
        await page.screenshot({ path: 'test-results/no-buttons.png', fullPage: true });
        throw new Error('No + buttons found on search results');
    }

    // Get the first article title
    const firstCardTitle = await page.locator('.list-card').first().locator('.list-card-title').textContent();
    console.log(`\n5. Clicking + on: "${firstCardTitle.substring(0, 60)}..."\n`);

    // Listen for console messages
    page.on('console', msg => {
        if (msg.type() === 'log' && !msg.text().includes('Failed to load resource')) {
            console.log(`   [Browser Console] ${msg.text()}`);
        }
        if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) {
            console.log(`   [Browser Error] ${msg.text()}`);
        }
    });

    // Listen for any alerts
    page.on('dialog', async dialog => {
        console.log(`\n   ⚠️ ALERT SHOWN: "${dialog.message()}"\n`);
        await page.screenshot({ path: 'test-results/alert-shown.png', fullPage: true });
        await dialog.accept();
    });

    // Click the + button
    console.log('6. Clicking + button NOW...\n');
    await moreButtons.first().click();

    // Wait and observe
    console.log('   Waiting 5 seconds to see what happens...\n');
    await page.waitForTimeout(5000);

    // Take screenshot after clicking
    await page.screenshot({ path: 'test-results/after-click.png', fullPage: true });
    console.log('   📸 Screenshot saved: after-click.png\n');

    // Check what's on screen now
    const bannerCount = await page.locator('.ai-analysis-banner').count();
    const newResultCount = await page.locator('.list-card').count();

    console.log('7. RESULTS AFTER CLICKING +:');
    console.log(`   - Full Coverage Banner: ${bannerCount > 0 ? '✓ SHOWN' : '❌ NOT SHOWN'}`);
    console.log(`   - Article cards visible: ${newResultCount}`);

    if (bannerCount > 0) {
        const bannerText = await page.locator('.ai-analysis-banner').first().textContent();
        console.log(`   - Banner says: "${bannerText.substring(0, 100)}..."`);
    }

    // Check if we have + buttons on the new results
    const newButtonCount = await page.locator('.list-card .more-btn').count();
    console.log(`   - + buttons on results: ${newButtonCount}\n`);

    if (newResultCount === 0) {
        console.log('❌ NO RESULTS SHOWN AFTER CLICKING +!\n');
        throw new Error('Clicking + button did not show any results');
    }

    // Try clicking + again (test continuous exploration)
    if (newButtonCount > 0) {
        console.log('8. Testing continuous exploration...');
        console.log('   Clicking + on second result...\n');

        await page.locator('.list-card .more-btn').nth(1).click();
        await page.waitForTimeout(5000);

        await page.screenshot({ path: 'test-results/second-click.png', fullPage: true });
        console.log('   📸 Screenshot saved: second-click.png\n');

        const finalResultCount = await page.locator('.list-card').count();
        const finalBannerCount = await page.locator('.ai-analysis-banner').count();

        console.log('9. RESULTS AFTER SECOND CLICK:');
        console.log(`   - Banner shown: ${finalBannerCount > 0 ? '✓ YES' : '❌ NO'}`);
        console.log(`   - Article cards: ${finalResultCount}`);
        console.log(`   - Continuous exploration: ${finalResultCount > 0 ? '✓ WORKING' : '❌ BROKEN'}\n`);
    }

    console.log('✅ VISUAL TEST COMPLETE - Check screenshots in test-results/\n');

    // Keep browser open for manual inspection
    console.log('Keeping browser open for 30 seconds for manual inspection...\n');
    await page.waitForTimeout(30000);
});
