// Mock the gdal module so getGdalJs returns an object with the functions
jest.mock('../gdal', () => ({
    getGdalJs: jest.fn(async () => ({
        open: jest.fn(async (_file: any) => ({ datasets: [] })),
        ogr2ogr: jest.fn(async () => ({ local: '' })),
        close: jest.fn(async () => { }),
        getFileBytes: jest.fn(async (_path: string) => new Uint8Array([])),
    })),
}));

// Mock JSZip so new JSZip() works in the test environment
jest.mock('jszip', () => {
    class MockJSZip {
        file = jest.fn();
        async generateAsync(_opts: any) {
            return new Blob([]);
        }
    }
    return { default: MockJSZip };
});

// Mock fastq so .promise exists and returns an object with push()
jest.mock('fastq', () => {
    const m: any = jest.fn();
    m.promise = (fn: any, _concurrency: number) => ({ push: (i: any) => Promise.resolve(fn(i)) });
    return { default: m };
});

import { GdalDownloader } from '../downloader';
import { QueryResult } from '../arcgis';

describe('GdalDownloader', () => {
    test('throws when no output files were generated', async () => {
        // Create a fake QueryResult with no features
        const fakeResult: any = {
            layer: { esri: { title: 'layer1', url: 'http://example.com/layer/1' } },
            numPages: 0,
            getPage: async (p: number) => ({ toJSON: () => ({ features: [] }) }),
        } as QueryResult;

        // Ensure Drivers mapping for GeoJSON is empty so no outputPaths are produced
        const dlModule = await import('../downloader') as any;
        dlModule.Drivers['GeoJSON'] = [];
        const downloader = new dlModule.GdalDownloader(() => { });
        let caught: any = null;
        try {
            await downloader.download([fakeResult], 1, 'GeoJSON');
        } catch (e) {
            caught = e;
        }
        if (!caught) throw new Error('expected download to throw but it did not');
        const msg = String(caught?.message ?? caught);
        if (!/No output files were generated/.test(msg)) {
            throw new Error(`unexpected message: ${msg}`);
        }
    });
});
