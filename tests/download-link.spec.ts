import { test, expect } from '@playwright/test';
import { layerUrl, boundaryText, whereClause } from './utils/constants.ts';

const fields = "FID,COUNTRY,ISO";

test.describe('Download Link', () => {
    test('page loads with URL parameters', async ({ page }) => {
        // Test that the page loads successfully when URL parameters are provided
        await page.goto(`/?layer_url=${encodeURIComponent(layerUrl)}&where=${encodeURIComponent(whereClause)}&boundary=${encodeURIComponent(boundaryText)}&fields=${fields}`);
        
        await page.waitForLoadState('networkidle');
        
        // Verify the page loaded successfully
        await expect(page).toHaveTitle('geodatadownloader');
    });
});
