/**
 * Comprehensive Tests for "+" (Explore More) Button
 * Testing 5 different scenarios to identify all issues
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

const APP_URL = `file://${path.resolve(__dirname, 'index.html')}`;

// Helper to complete survey
async function completeSurvey(page) {
    await page.waitForSelector('.truth-survey', { timeout: 5000 });
    // Radio buttons are checked by default, just click Start
    await page.click('#start-btn');
    await page.waitForSelector('#feed-view', { timeout: 5000 });
}

test.describe('Explore More Button (+) - Comprehensive Testing', () => {

    // TEST 1: Click + on web search results
    test('Test 1: Click + on web search results', async ({ page }) => {
        console.log('\n=== TEST 1: Web Search Results ===');

        await page.goto(APP_URL);
        await completeSurvey(page);

        // Go to Search tab
        await page.click('button[data-tab="search"]');
        await page.waitForSelector('#search-view.active', { timeout: 5000 });

        // Perform web search
        await page.fill('#web-search-input', 'artificial intelligence');
        await page.click('#web-search-btn');

        // Wait for results
        await page.waitForSelector('.list-card', { timeout: 15000 });

        const initialResults = await page.locator('.list-card').count();
        console.log(`  ✓ Search returned ${initialResults} results`);

        // Look for + buttons
        const moreButtons = await page.locator('.list-card .more-btn');
        const moreButtonCount = await moreButtons.count();
        console.log(`  ✓ Found ${moreButtonCount} + buttons`);

        if (moreButtonCount === 0) {
            console.log('  ❌ ISSUE: No + buttons found on search results');
            expect(moreButtonCount).toBeGreaterThan(0);
            return;
        }

        // Click the first + button
        console.log('  → Clicking first + button...');

        // Set up console listener to catch errors
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        // Set up dialog listener to catch alerts
        let alertShown = false;
        let alertMessage = '';
        page.on('dialog', async dialog => {
            alertShown = true;
            alertMessage = dialog.message();
            console.log(`  ⚠️ ISSUE: Alert shown: "${alertMessage}"`);
            await dialog.accept();
        });

        await moreButtons.first().click();

        // Wait a bit for processing
        await page.waitForTimeout(5000);

        // Check if alert was shown
        if (alertShown) {
            console.log(`  ❌ ISSUE: Alert appeared: "${alertMessage}"`);
        }

        // Check for console errors
        if (consoleErrors.length > 0) {
            console.log(`  ❌ ISSUE: Console errors:`, consoleErrors);
        }

        // Check if Full Coverage banner appeared
        const fullCoverageBanner = await page.locator('.ai-analysis-banner').count();
        console.log(`  ${fullCoverageBanner > 0 ? '✓' : '❌'} Full Coverage banner: ${fullCoverageBanner > 0 ? 'SHOWN' : 'NOT SHOWN'}`);

        // Check if new results appeared
        const newResultsCount = await page.locator('.list-card').count();
        console.log(`  ${newResultsCount > 0 ? '✓' : '❌'} Results after + click: ${newResultsCount}`);

        expect(alertShown).toBe(false);
        expect(newResultsCount).toBeGreaterThan(0);
    });

    // TEST 2: Click + on Full Coverage results (second click)
    test('Test 2: Click + on Full Coverage results (continuous exploration)', async ({ page }) => {
        console.log('\n=== TEST 2: Full Coverage Results (Second Click) ===');

        await page.goto(APP_URL);
        await completeSurvey(page);

        await page.click('button[data-tab="search"]');
        await page.fill('#web-search-input', 'technology news');
        await page.click('#web-search-btn');
        await page.waitForSelector('.list-card', { timeout: 15000 });

        console.log('  → First + click...');

        let alertShown = false;
        page.on('dialog', async dialog => {
            alertShown = true;
            console.log(`  ⚠️ Alert on first click: "${dialog.message()}"`);
            await dialog.accept();
        });

        await page.locator('.list-card .more-btn').first().click();
        await page.waitForTimeout(5000);

        if (alertShown) {
            console.log('  ❌ ISSUE: First + click failed');
            expect(alertShown).toBe(false);
            return;
        }

        const afterFirstClick = await page.locator('.list-card').count();
        console.log(`  ✓ After first click: ${afterFirstClick} results`);

        // Now click + again on the new results
        console.log('  → Second + click (testing continuous exploration)...');

        alertShown = false;
        const moreButtons = await page.locator('.list-card .more-btn');
        const buttonCount = await moreButtons.count();
        console.log(`  ✓ Found ${buttonCount} + buttons in Full Coverage results`);

        if (buttonCount === 0) {
            console.log('  ❌ ISSUE: No + buttons on Full Coverage results');
            expect(buttonCount).toBeGreaterThan(0);
            return;
        }

        await moreButtons.first().click();
        await page.waitForTimeout(5000);

        if (alertShown) {
            console.log('  ❌ ISSUE: Second + click showed alert (continuous exploration broken)');
        }

        const afterSecondClick = await page.locator('.list-card').count();
        console.log(`  ${afterSecondClick > 0 ? '✓' : '❌'} After second click: ${afterSecondClick} results`);

        expect(alertShown).toBe(false);
        expect(afterSecondClick).toBeGreaterThan(0);
    });

    // TEST 3: Click + from Feed tab
    test('Test 3: Click + from Feed tab', async ({ page }) => {
        console.log('\n=== TEST 3: Feed Tab Articles ===');

        await page.goto(APP_URL);
        await completeSurvey(page);

        // Should be on Feed tab by default
        await page.waitForSelector('.tiktok-article', { timeout: 5000 });

        // Look for + buttons in feed
        const moreButtons = await page.locator('.tiktok-article .more-btn');
        const buttonCount = await moreButtons.count();
        console.log(`  ${buttonCount > 0 ? '✓' : '❌'} Found ${buttonCount} + buttons in feed`);

        if (buttonCount === 0) {
            console.log('  ⚠️ ISSUE: No + buttons in Feed (may be by design)');
            return;
        }

        let alertShown = false;
        page.on('dialog', async dialog => {
            alertShown = true;
            console.log(`  Alert: "${dialog.message()}"`);
            await dialog.accept();
        });

        await moreButtons.first().click();
        await page.waitForTimeout(5000);

        // Check if switched to Search tab
        const searchTabActive = await page.locator('#search-view.active').count();
        console.log(`  ${searchTabActive > 0 ? '✓' : '❌'} Switched to Search tab: ${searchTabActive > 0}`);

        const results = await page.locator('.list-card').count();
        console.log(`  ${results > 0 ? '✓' : '❌'} Results shown: ${results}`);

        expect(alertShown).toBe(false);
    });

    // TEST 4: Click + from Explore tab
    test('Test 4: Click + from Explore tab', async ({ page }) => {
        console.log('\n=== TEST 4: Explore Tab Articles ===');

        await page.goto(APP_URL);
        await completeSurvey(page);

        await page.click('button[data-tab="explore"]');
        await page.waitForSelector('#explore-view.active', { timeout: 5000 });

        // Check if there are articles
        const articleCount = await page.locator('.list-card').count();
        console.log(`  ✓ Explore tab has ${articleCount} articles`);

        if (articleCount === 0) {
            console.log('  ⚠️ No articles to test (may need modal search first)');
            return;
        }

        const moreButtons = await page.locator('.list-card .more-btn');
        const buttonCount = await moreButtons.count();
        console.log(`  ${buttonCount > 0 ? '✓' : '❌'} Found ${buttonCount} + buttons`);

        if (buttonCount === 0) {
            console.log('  ⚠️ ISSUE: No + buttons in Explore tab');
            return;
        }

        let alertShown = false;
        page.on('dialog', async dialog => {
            alertShown = true;
            console.log(`  Alert: "${dialog.message()}"`);
            await dialog.accept();
        });

        await moreButtons.first().click();
        await page.waitForTimeout(5000);

        const results = await page.locator('.list-card').count();
        console.log(`  ${results > 0 ? '✓' : '❌'} Results after click: ${results}`);

        expect(alertShown).toBe(false);
    });

    // TEST 5: Click + with no API key
    test('Test 5: Click + without Claude API key (fallback behavior)', async ({ page }) => {
        console.log('\n=== TEST 5: No API Key (Fallback) ===');

        await page.goto(APP_URL);

        // Clear localStorage to ensure no API key
        await page.evaluate(() => {
            localStorage.clear();
        });

        await page.reload();
        await completeSurvey(page);

        await page.click('button[data-tab="search"]');
        await page.fill('#web-search-input', 'climate change');
        await page.click('#web-search-btn');
        await page.waitForSelector('.list-card', { timeout: 15000 });

        console.log('  ✓ Search completed (backend API)');

        let alertShown = false;
        let alertMessage = '';
        page.on('dialog', async dialog => {
            alertShown = true;
            alertMessage = dialog.message();
            console.log(`  Alert: "${dialog.message()}"`);
            await dialog.accept();
        });

        const consoleMessages = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleMessages.push(msg.text());
                console.log(`  Console error: ${msg.text()}`);
            }
        });

        await page.locator('.list-card .more-btn').first().click();
        await page.waitForTimeout(5000);

        if (alertShown) {
            console.log(`  ❌ ISSUE: Alert shown without API key: "${alertMessage}"`);
            console.log('  → Expected: Backend search fallback should work');
        }

        const results = await page.locator('.list-card').count();
        console.log(`  ${results > 0 ? '✓' : '❌'} Results after + click: ${results}`);

        // Without API key, should still work using backend search
        expect(results).toBeGreaterThan(0);
    });
});
