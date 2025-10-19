import { assertNoArcGISError } from '../arcgis';

describe('assertNoArcGISError', () => {
    test('throws when JSON contains error object', () => {
        const json = { error: { code: 500, message: 'Server failure' } };
        try {
            assertNoArcGISError(json, 'test-url');
            // If we got here the function didn't throw which is a failure
            throw new Error('expected assertNoArcGISError to throw');
        } catch (e: any) {
            const msg = String(e?.message ?? e);
            if (!/ArcGIS server error \(test-url\): Server failure/.test(msg)) {
                throw new Error(`unexpected error message: ${msg}`);
            }
        }
    });

    test('does not throw when JSON has no error', () => {
        const json = { folders: [] };
        // Should not throw
        assertNoArcGISError(json);
    });
});
