/**
 * Test + button with Claude API via proxy
 */

// Load environment variables from .env file
require('dotenv/config');

const { test, expect } = require('@playwright/test');
const path = require('path');

const APP_URL = `file://${path.resolve(__dirname, 'index.html')}`;

test('Test + button with Claude API proxy', async ({ page }) => {
    console.log('\n🔍 Testing + button with Claude API via localhost:8081 proxy\n');

    // Set API key in localStorage before loading the app
    await page.goto(APP_URL);

    // Get API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable not set. Create a .env file with your key.');
    }

    await page.evaluate((key) => {
        let prefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        prefs.apiKey = key;
        localStorage.setItem('userPreferences', JSON.stringify(prefs));
    }, apiKey);

    // Reload to pick up the API key
    await page.reload();

    console.log('1. API key configured in localStorage');

    // Complete survey
    await page.waitForSelector('.truth-survey', { timeout: 5000 });
    await page.click('#start-btn');
    await page.waitForSelector('#feed-view', { timeout: 5000 });
    console.log('2. Survey completed\n');

    // Listen for ALL console messages BEFORE doing anything
    const consoleMessages = [];
    page.on('console', msg => {
        const text = msg.text();
        consoleMessages.push(text);
        if (text.includes('API Key') || text.includes('Claude') || text.includes('⚠️') || text.includes('🔍')) {
            console.log(`   [Browser] ${text}`);
        }
    });

    // Go to Search tab
    await page.click('button[data-tab="search"]');
    await page.waitForSelector('#search-view.active', { timeout: 5000 });

    // Perform search
    await page.fill('#web-search-input', 'artificial intelligence');
    await page.click('#web-search-btn');
    await page.waitForSelector('.list-card', { timeout: 15000 });
    console.log('3. Search completed\n');

    // Listen for fetch requests to the proxy
    page.on('request', request => {
        if (request.url().includes('localhost:8081')) {
            console.log(`   [Proxy Request] ${request.method()} ${request.url()}`);
        }
    });

    // Click the + button
    const moreButtons = await page.locator('.list-card .more-btn');
    const buttonCount = await moreButtons.count();
    console.log(`4. Found ${buttonCount} + buttons\n`);

    if (buttonCount > 0) {
        console.log('5. Clicking + button (should trigger Claude API via proxy)...\n');
        await moreButtons.first().click();

        // Wait for Claude API to respond
        await page.waitForTimeout(8000);

        // Check results
        const bannerCount = await page.locator('.ai-analysis-banner').count();
        const resultCount = await page.locator('.list-card').count();

        console.log('6. Results:');
        console.log(`   - Full Coverage banner: ${bannerCount > 0 ? '✅ SHOWN' : '❌ NOT SHOWN'}`);
        console.log(`   - Articles: ${resultCount}`);

        if (bannerCount > 0) {
            const bannerText = await page.locator('.ai-analysis-banner').first().innerText();
            console.log(`   - Banner text: "${bannerText.substring(0, 100)}..."`);
        }

        expect(bannerCount).toBeGreaterThan(0);
        expect(resultCount).toBeGreaterThan(0);

        console.log('\n✅ TEST PASSED: + button works with Claude API via proxy!');

        // Print ALL console messages to debug
        console.log('\n📋 All Console Messages (' + consoleMessages.length + ' total):');
        consoleMessages.forEach((m, i) => {
            if (i < 30) { // Limit to first 30
                console.log(`   [${i}] ${m.substring(0, 100)}`);
            }
        });
    } else {
        throw new Error('No + buttons found');
    }
});
