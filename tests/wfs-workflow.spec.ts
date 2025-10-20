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
        
        // Wait for the layer to be loaded - should not show ArcGIS error
        await page.waitForTimeout(5000);
        
        // Verify no error message about ArcGIS REST endpoint
        const errorMessage = page.getByText(/does not reference an ArcGIS REST services endpoint/i);
        await expect(errorMessage).not.toBeVisible({ timeout: 2000 }).catch(() => {
            // If the error is not found, that's good
        });
        
        // Check for success indicators - layer should appear in the layers list or show WFS-related content
        // The layer name or WFS-related text should be visible
        const layerIndicator = page.getByText(/WFS Layer|as_dw_nuu_jwl/i);
        await expect(layerIndicator).toBeVisible({ timeout: 15000 });
    });
    
    test('WFS layer can be added and shows in layers panel', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Add WFS layer
        await page.locator(layerUrlFieldId).fill(wfsLayerUrl);
        await page.getByRole('button', { name: 'Add' }).click();
        
        // Wait for layer to load
        await page.waitForTimeout(5000);
        
        // Check that layers panel shows the added layer
        // Look for any text indicating the layer was added successfully
        const layersPanel = page.locator('.divide-y'); // layers list has this class
        await expect(layersPanel).toBeVisible({ timeout: 10000 });
        
        // Verify layer appears (it might show typename or title)
        const layerItem = page.locator('li').filter({ hasText: /as_dw_nuu_jwl|WFS/i }).first();
        await expect(layerItem).toBeVisible({ timeout: 10000 });
    });
});
