import { test, expect } from '@playwright/test';
import {
    layerUrl,
    layerUrlFieldId,
} from './utils/constants.ts';

test.describe('Layer Panel Layout', () => {
    test('layer panel text is visible without scrolling', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Add a layer first
        await page.locator(layerUrlFieldId).fill(layerUrl);
        await page.getByRole('button', { name: 'Add' }).click();

        // Wait for layer to be added (boundary field becomes visible)
        await expect(page.locator('#boundary-text-field')).toBeVisible({ timeout: 10000 });

        // Check that the explanatory text is visible
        const explanatoryText = page.getByText('Only checked layers are downloaded');
        await expect(explanatoryText).toBeVisible();

        // Verify the text is in the viewport without scrolling
        const isInViewport = await explanatoryText.evaluate((element) => {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= window.innerHeight &&
                rect.right <= window.innerWidth
            );
        });

        expect(isInViewport).toBe(true);
    });

    test('no scrollbars appear on the page', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Add a layer
        await page.locator(layerUrlFieldId).fill(layerUrl);
        await page.getByRole('button', { name: 'Add' }).click();
        await expect(page.locator('#boundary-text-field')).toBeVisible({ timeout: 10000 });

        // Check that document body has no vertical scrollbar
        const hasVerticalScrollbar = await page.evaluate(() => {
            return document.documentElement.scrollHeight > document.documentElement.clientHeight;
        });

        expect(hasVerticalScrollbar).toBe(false);
    });

    test('left panel footer stays fixed at bottom', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Add multiple layers to create a longer list
        for (let i = 0; i < 3; i++) {
            await page.locator(layerUrlFieldId).fill(layerUrl);
            await page.getByRole('button', { name: 'Add' }).click();
            await page.waitForTimeout(1000); // Wait between layer additions
        }

        await expect(page.locator('#boundary-text-field')).toBeVisible({ timeout: 10000 });

        // The explanatory text should still be visible at the bottom
        const explanatoryText = page.getByText('Only checked layers are downloaded');
        await expect(explanatoryText).toBeVisible();

        // Verify it's positioned at the bottom of the left panel
        const textPosition = await explanatoryText.boundingBox();
        expect(textPosition).not.toBeNull();

        // The text should be near the bottom of the viewport
        if (textPosition) {
            const viewportSize = page.viewportSize();
            const viewportHeight = viewportSize?.height || 0;
            // Text should be in the lower portion of the screen
            expect(textPosition.y + textPosition.height).toBeLessThan(viewportHeight);
        }
    });
});
