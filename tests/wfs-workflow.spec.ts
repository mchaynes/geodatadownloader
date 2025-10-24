import { test, expect } from '@playwright/test';
import { layerUrlFieldId } from './utils/constants';

// WFS layer URL for testing
const wfsLayerUrl = 'http://geo.pacioos.hawaii.edu/geoserver/PACIOOS/as_dw_nuu_jwl/ows';

test.describe('WFS Workflow', () => {
    test('WFS URL does not show ArcGIS error', async ({ page }) => {
        await page.goto('/');
        
        // Wait for the page to load
        await page.waitForLoadState('networkidle');
        
        // Type in WFS layer URL and click Add button
        await page.locator(layerUrlFieldId).fill(wfsLayerUrl);
        await expect(page.locator(layerUrlFieldId)).toHaveValue(wfsLayerUrl);
        
        // Click Add button (submit button with text "Add")
        await page.getByRole('button', { name: 'Add' }).click();
        
        // Wait for either success, CORS error, or ArcGIS error to appear
        const layerIndicator = page.getByText(/WFS Layer|as_dw_nuu_jwl/i);
        const arcgisError = page.getByText(/does not reference an ArcGIS REST services endpoint/i);
        const corsError = page.getByText(/CORS restrictions|cross-origin/i);
        
        // Wait for one of the indicators to be visible
        await Promise.race([
            layerIndicator.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
            arcgisError.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
            corsError.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {})
        ]);
        
        // Main assertion: Should NOT show ArcGIS REST endpoint error
        // (CORS errors are acceptable since the service doesn't allow cross-origin requests)
        await expect(arcgisError).not.toBeVisible();
        
        // Either success OR CORS error is acceptable
        const layerVisible = await layerIndicator.isVisible().catch(() => false);
        const corsVisible = await corsError.isVisible().catch(() => false);
        expect(layerVisible || corsVisible).toBeTruthy();
    });
    
    test('WFS URL is detected and handled separately from ArcGIS', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Add WFS layer
        await page.locator(layerUrlFieldId).fill(wfsLayerUrl);
        await page.getByRole('button', { name: 'Add' }).click();
        
        // The key test: WFS URLs should not go through ArcGIS analysis
        // So we should never see "does not reference an ArcGIS REST services endpoint"
        const arcgisError = page.getByText(/does not reference an ArcGIS REST services endpoint/i);
        
        // Wait a moment for any errors to appear
        await page.waitForTimeout(3000);
        
        // Verify ArcGIS error is not shown (CORS error is acceptable)
        await expect(arcgisError).not.toBeVisible();
    });
});
