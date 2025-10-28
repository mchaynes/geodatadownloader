import { test, expect } from '@playwright/test';
import {
    layerUrl,
    layerUrlFieldId,
    boundaryText,
    boundaryFieldId,
} from './utils/constants.ts';

test.describe('Main Workflow', () => {
    test('can add a layer', async ({ page }) => {
        await page.goto('/');
        
        // Wait for the page to load
        await page.waitForLoadState('networkidle');
        
        // Type in layer URL and click Add button
        await page.locator(layerUrlFieldId).fill(layerUrl);
        await expect(page.locator(layerUrlFieldId)).toHaveValue(layerUrl);
        
        // Click Add button (submit button with text "Add")
        await page.getByRole('button', { name: 'Add' }).click();

        // Verify layer was added by checking if boundary field is now visible
        await expect(page.locator(boundaryFieldId)).toBeVisible();
    });
    
    test('can set boundary text', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Add layer first
        await page.locator(layerUrlFieldId).fill(layerUrl);
        await page.getByRole('button', { name: 'Add' }).click();
        await expect(page.locator(boundaryFieldId)).toBeVisible();
        
        // Type in boundary text
        await page.locator(boundaryFieldId).fill(boundaryText);
        await expect(page.locator(boundaryFieldId)).toHaveValue(boundaryText);
    });
});
