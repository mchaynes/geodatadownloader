import { test, expect } from '@playwright/test';
import {
    layerUrl,
    layerUrlFieldId,
    boundaryText,
    boundaryFieldId,
    whereTextfieldId,
} from '../utils/constants';

test.describe('Main Workflow', () => {
    test('can download data', async ({ page }) => {
        await page.goto('/');
        
        // Type in layer URL
        await page.locator(layerUrlFieldId).fill(layerUrl);
        await expect(page.locator(layerUrlFieldId)).toHaveValue(layerUrl);
        
        // Click load layer
        await page.locator('#load-layer').click();

        // Type in boundary text
        await page.locator(boundaryFieldId).fill(boundaryText);
        
        // Type in where clause
        await page.locator(whereTextfieldId).clear();
        await page.locator(whereTextfieldId).fill(`ISO = 'EG'`);
        
        // Wait for the displaying text to appear with timeout
        await expect(page.getByText('Displaying 1 / 1 features')).toBeVisible({ timeout: 15000 });

        // Test invalid where clause
        await page.locator(whereTextfieldId).clear();
        await page.locator(whereTextfieldId).fill('1=');
        
        await expect(page.getByText('Failed:')).toBeVisible();

        // Test valid where clause
        await page.locator(whereTextfieldId).clear();
        await page.locator(whereTextfieldId).fill('1=1');

        // Test concurrent requests warning
        await page.locator('#concurrent-requests-input').clear();
        await page.locator('#concurrent-requests-input').fill('4');
        await expect(page.getByText('Careful, setting higher than default concurrency')).toBeVisible();
    });
});
