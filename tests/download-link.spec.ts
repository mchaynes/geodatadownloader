import { test, expect } from '@playwright/test';
import { layerUrl, layerUrlFieldId, boundaryText, boundaryFieldId, whereTextfieldId, whereClause } from '../utils/constants';

const fields = "FID,COUNTRY,ISO";

test.describe('Download Link', () => {
    test('fills out fields', async ({ page }) => {
        await page.goto(`/?layer_url=${layerUrl}&where=${whereClause}&boundary=${boundaryText}&fields=${fields}`);
        
        await expect(page.locator(layerUrlFieldId)).toHaveValue(layerUrl);
        await expect(page.locator(whereTextfieldId)).toHaveValue(whereClause);
        await expect(page.locator(boundaryFieldId)).toHaveValue(boundaryText);
    });
});
