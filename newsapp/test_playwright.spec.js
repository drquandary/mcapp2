/**
 * Playwright Tests for NewsMode Bug Fixes
 * Tests:
 * 1. Modal selector is hidden from users
 * 2. Explore more button works in search results
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

const APP_URL = `file://${path.resolve(__dirname, 'index.html')}`;

test.describe('NewsMode Bug Fixes', () => {
    test('Modal selector should be hidden in Explore tab', async ({ page }) => {
        await page.goto(APP_URL);

        // Complete the onboarding survey
        await page.waitForSelector('.truth-survey', { timeout: 5000 });

        // Answer all 5 questions (select option 3 for each)
        for (let i = 1; i <= 5; i++) {
            await page.click(`input[name="q${i}"][value="3"]`);
        }

        // Click Start Reading
        await page.click('#start-btn');

        // Wait for main view to load
        await page.waitForSelector('#feed-view', { timeout: 5000 });

        // Navigate to Explore tab
        await page.click('button[data-tab="explore"]');

        // Wait for Explore view
        await page.waitForSelector('#explore-view.active', { timeout: 5000 });

        // Check that modal filters are hidden
        const modalFilters = await page.locator('.modal-filters');
        const isVisible = await modalFilters.isVisible();

        expect(isVisible).toBeFalsy();
        console.log('✓ Modal filters are hidden from users');
    });

    test('Explore more button should work in search results', async ({ page }) => {
        await page.goto(APP_URL);

        // Complete the onboarding survey
        await page.waitForSelector('.truth-survey', { timeout: 5000 });

        for (let i = 1; i <= 5; i++) {
            await page.click(`input[name="q${i}"][value="3"]`);
        }

        await page.click('#start-btn');
        await page.waitForSelector('#feed-view', { timeout: 5000 });

        // Navigate to Search tab
        await page.click('button[data-tab="search"]');
        await page.waitForSelector('#search-view.active', { timeout: 5000 });

        // Perform a web search
        await page.fill('#web-search-input', 'artificial intelligence');
        await page.click('#web-search-btn');

        // Wait for search results to load
        await page.waitForSelector('.list-card', { timeout: 10000 });

        // Count initial articles
        const initialArticles = await page.locator('.list-card').count();
        console.log(`✓ Search returned ${initialArticles} articles`);

        expect(initialArticles).toBeGreaterThan(0);

        // Click the "+" (explore more) button on the first article
        const firstMoreBtn = await page.locator('.list-card .more-btn').first();
        await firstMoreBtn.click();

        // Wait for the explore results to load
        await page.waitForTimeout(3000); // Give AI time to analyze

        // Check that we're in the search view with new results
        const searchFeed = await page.locator('#search-feed');
        const feedContent = await searchFeed.textContent();

        // Should show "Full Coverage" banner
        const hasCoverageBanner = feedContent.includes('Full Coverage') ||
                                   feedContent.includes('Searching for');

        expect(hasCoverageBanner).toBeTruthy();
        console.log('✓ Explore more button triggered search');

        // Now click "+" on one of these new results
        await page.waitForSelector('.list-card .more-btn', { timeout: 5000 });
        const secondMoreBtn = await page.locator('.list-card .more-btn').first();
        await secondMoreBtn.click();

        // Wait for second exploration
        await page.waitForTimeout(3000);

        // Should still show results (not stuck/broken)
        const secondSearchFeed = await page.locator('#search-feed');
        const secondContent = await secondSearchFeed.textContent();

        const hasSecondResults = secondContent.includes('Full Coverage') ||
                                  secondContent.includes('Searching for') ||
                                  secondContent.length > 100;

        expect(hasSecondResults).toBeTruthy();
        console.log('✓ Explore more button works on search results (no state corruption)');
    });

    test('Search results should not replace original feed', async ({ page }) => {
        await page.goto(APP_URL);

        // Complete survey
        await page.waitForSelector('.truth-survey', { timeout: 5000 });
        for (let i = 1; i <= 5; i++) {
            await page.click(`input[name="q${i}"][value="3"]`);
        }
        await page.click('#start-btn');
        await page.waitForSelector('#feed-view', { timeout: 5000 });

        // Go to Feed tab and verify articles exist
        await page.click('button[data-tab="feed"]');
        await page.waitForSelector('.tiktok-article', { timeout: 5000 });

        const feedArticles = await page.locator('.tiktok-article').count();
        console.log(`✓ Feed has ${feedArticles} articles initially`);

        // Perform web search
        await page.click('button[data-tab="search"]');
        await page.fill('#web-search-input', 'technology news');
        await page.click('#web-search-btn');
        await page.waitForSelector('.list-card', { timeout: 10000 });

        const searchResults = await page.locator('.list-card').count();
        console.log(`✓ Search returned ${searchResults} articles`);

        // Go back to Feed tab
        await page.click('button[data-tab="feed"]');
        await page.waitForTimeout(500);

        // Verify original articles still exist
        const feedArticlesAfter = await page.locator('.tiktok-article').count();
        console.log(`✓ Feed still has ${feedArticlesAfter} articles after search`);

        expect(feedArticlesAfter).toBeGreaterThan(0);
    });
});
