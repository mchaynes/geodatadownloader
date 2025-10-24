import { test, expect } from '@playwright/test';
import { layerUrlFieldId } from './utils/constants';

// WFS layer URL for testing
const wfsLayerUrl = 'http://geo.pacioos.hawaii.edu/geoserver/PACIOOS/as_dw_nuu_jwl/ows';

test.describe('WFS Workflow', () => {
    test('can add a WFS layer from OWS endpoint', async ({ page }) => {
        await page.goto('/');
        
        // Wait for the page to load
        await page.waitForLoadState('networkidle');
        
        // Type in WFS layer URL and click Add button
        await page.locator(layerUrlFieldId).fill(wfsLayerUrl);
        await expect(page.locator(layerUrlFieldId)).toHaveValue(wfsLayerUrl);
        
        // Click Add button (submit button with text "Add")
        await page.getByRole('button', { name: 'Add' }).click();
        
        // Wait for either success or error indicators to appear
        const layerIndicator = page.getByText(/WFS Layer|as_dw_nuu_jwl/i);
        const errorMessage = page.getByText(/does not reference an ArcGIS REST services endpoint/i);
        
        // Wait for one of the indicators to be visible
        await Promise.race([
            layerIndicator.waitFor({ state: 'visible', timeout: 15000 }),
            errorMessage.waitFor({ state: 'visible', timeout: 15000 })
        ]);
        
        // Verify no error message about ArcGIS REST endpoint
        await expect(errorMessage).not.toBeVisible();
        
        // Check for success indicators - layer should appear in the layers list or show WFS-related content
        await expect(layerIndicator).toBeVisible();
    });
    
    test('WFS layer can be added and shows in layers panel', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Add WFS layer
        await page.locator(layerUrlFieldId).fill(wfsLayerUrl);
        await page.getByRole('button', { name: 'Add' }).click();
        
        // Wait for layers panel to be visible
        const layersPanel = page.locator('.divide-y'); // layers list has this class
        await layersPanel.waitFor({ state: 'visible', timeout: 10000 });
        
        // Verify layer appears (it might show typename or title)
        const layerItem = page.locator('li').filter({ hasText: /as_dw_nuu_jwl|WFS/i }).first();
        await expect(layerItem).toBeVisible({ timeout: 10000 });
    });
});
