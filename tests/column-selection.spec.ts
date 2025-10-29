import { test, expect } from '@playwright/test';
import { parse } from 'csv-parse/sync';
import JSZip from 'jszip';
import fs from 'fs';

// Using King County layer as specified in the issue
const layerUrl = "https://gismaps.kingcounty.gov/arcgis/rest/services/Census/KingCo_Demographics/MapServer/4";
const layerUrlFieldId = "#default-search";

test.describe('Column Selection and Renaming', () => {
    test('can configure 2 columns and CSV contains only renamed columns', async ({ page, context }) => {
        // Navigate to the app
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Add the layer
        await page.locator(layerUrlFieldId).fill(layerUrl);
        await page.getByRole('button', { name: 'Add' }).click();
        
        // Wait until the layer's menu button is visible, then open dropdown
        const menuButton = page.locator('button:has(svg[viewBox="0 0 4 15"])').first();
        await menuButton.waitFor({ state: 'visible' });
        await menuButton.click();
        
        // Click "Filters & Attributes..." menu item
        await page.getByText('Filters & Attributes...').click();
        
        // Wait for the modal to appear and the table to be fully loaded
        const table = page.locator('table').first();
        await expect(table).toBeVisible();
        
        // Wait for the table head to be present
        const thead = table.locator('thead');
        await expect(thead).toBeVisible();
        
        // Verify table headers - using direct text locators within thead
        await expect(thead.locator('text=Include')).toBeVisible();
        await expect(thead.locator('text=Original Name')).toBeVisible();
        await expect(thead.locator('text=New Name')).toBeVisible();
        await expect(thead.locator('text=Sample Value')).toBeVisible();
        
        // We'll select only 2 columns and rename them, leaving all others unselected
        const checkboxes = page.locator('input[type="checkbox"][name$="-enabled"]');
        const checkboxCount = await checkboxes.count();

        // Uncheck all checkboxes first (ensure a clean slate)
        for (let i = 0; i < checkboxCount; i++) {
            const checkbox = checkboxes.nth(i);
            if (await checkbox.isChecked()) {
                await checkbox.uncheck();
            }
        }

        // Now check and rename the first 2 columns
        // Get the first field name to use for selection
        const firstFieldName = await page.locator('input[name$="-enabled"]').first().getAttribute('name');
        if (firstFieldName) {
            const fieldBaseName = firstFieldName.replace('-enabled', '');
            
            // Check the first checkbox
            await page.locator(`input[name="${fieldBaseName}-enabled"]`).check();
            
            // Rename it
            const renameInput = page.locator(`input[name="${fieldBaseName}-new"]`);
            await renameInput.clear();
            await renameInput.fill('Renamed_Field_1');
        }
        
        // Get second field
        const secondFieldName = await page.locator('input[name$="-enabled"]').nth(1).getAttribute('name');
        if (secondFieldName) {
            const fieldBaseName = secondFieldName.replace('-enabled', '');
            await page.locator(`input[name="${fieldBaseName}-enabled"]`).check();
            const renameInput = page.locator(`input[name="${fieldBaseName}-new"]`);
            await renameInput.clear();
            await renameInput.fill('Renamed_Field_2');
        }

        // Click Save button
        await page.getByRole('button', { name: 'Save' }).click();
        
        // Wait for modal to close by asserting the table disappears
        await expect(table).toBeHidden();
        
        // Select CSV format from dropdown
        await page.locator('select#format').selectOption('CSV');
        
        // Set up listeners for new tab and download
        const downloadPromise = context.waitForEvent('page').then(async (newPage) => {
            // Wait for the download page to load
            await newPage.waitForLoadState('networkidle');
            
            // Wait for download event on the new page
            const download = await newPage.waitForEvent('download', { timeout: 60000 });
            return download;
        });
        
        // Click Download button (opens new tab)
        await page.getByRole('button', { name: 'Download' }).click();
        
        // Wait for download to complete
        const download = await downloadPromise;
        
        // Save the downloaded file
        const downloadPath = `/tmp/test-download-${Date.now()}.zip`;
        await download.saveAs(downloadPath);
        
        // Verify the file was downloaded
        expect(download.suggestedFilename()).toContain('.zip');

        // Unzip and verify CSV contents include ONLY the two renamed columns
        const zipBuffer = fs.readFileSync(downloadPath);
        const zip = await JSZip.loadAsync(zipBuffer as unknown as Uint8Array);
        const csvEntryName = Object.keys(zip.files).find(k => k.toLowerCase().endsWith('.csv'));
        expect(csvEntryName, 'CSV file should exist within the ZIP').toBeTruthy();
        const csvText = await zip.file(csvEntryName!)!.async('string');

        // Parse CSV header
        const records = parse(csvText, { columns: true });
        expect(records.length).toBeGreaterThan(0);
        const headerColumns = Object.keys(records[0]);

        // Validate only the two renamed columns are present
        expect(headerColumns).toEqual(['Renamed_Field_1', 'Renamed_Field_2']);
        // Also assert that no extra columns slipped in
        expect(headerColumns.length).toBe(2);
    });
    
    test('modal displays columns vertically for layers with many columns', async ({ page }) => {
        // Navigate to the app
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Add the layer (King County layer has many columns)
        await page.locator(layerUrlFieldId).fill(layerUrl);
        await page.getByRole('button', { name: 'Add' }).click();
        
        // Wait for the layer's menu button and open it
        const menuButton = page.locator('button:has(svg[viewBox="0 0 4 15"])').first();
        await menuButton.waitFor({ state: 'visible' });
        await menuButton.click();
        
        // Click "Filters & Attributes..."
        await page.getByText('Filters & Attributes...').click();
        
        // Wait for the configuration table to be visible in the modal
        await expect(page.locator('table').first()).toBeVisible();
        
        // Verify the table is scrollable and has reasonable width
        const table = page.locator('table').first();
        await expect(table).toBeVisible();
        
        // Verify we have multiple rows (one per column)
        const rows = page.locator('tbody tr');
        const rowCount = await rows.count();
        console.log(`Table has ${rowCount} rows (columns)`);
        
        // Verify the table has at least a few columns to show it's the King County layer
        expect(rowCount).toBeGreaterThan(5);
        
        // Verify the container is scrollable
        const scrollContainer = page.locator('div.max-h-96.overflow-y-auto');
        await expect(scrollContainer).toBeVisible();
        
        // Take a screenshot to verify the layout
        await page.screenshot({ path: '/tmp/column-modal-layout.png', fullPage: true });
    });
});
