import { describe, expect, it, beforeEach, afterEach, jest } from "@jest/globals";
import esriRequest from "@arcgis/core/request";
import { analyzeArcGISEndpoint, traverseFeatureLayers } from "../traverse";

jest.mock("@arcgis/core/request");

const mockedEsriRequest = esriRequest as jest.MockedFunction<typeof esriRequest>;

describe("traverseFeatureLayers", () => {
    const rootUrl = "https://example.com/arcgis/rest/services";
    const rootUrlWithSlash = `${rootUrl}/`;
    const hydroFolderUrl = `${rootUrl}/Hydro`;
    const drainageServiceUrl = `${rootUrl}/Hydro/drainage_basins/MapServer`;

    beforeEach(() => {
        mockedEsriRequest.mockImplementation(async (url: string) => {
            switch (url) {
                case rootUrl:
                case rootUrlWithSlash:
                    return createEsriResponse({
                        folders: ["Hydro"],
                        services: [],
                    });
                case hydroFolderUrl:
                    return createEsriResponse({
                        folders: [],
                        services: [
                            {
                                name: "Hydro/drainage_basins",
                                type: "MapServer",
                            },
                        ],
                    });
                case drainageServiceUrl:
                    return createEsriResponse({
                        layers: [
                            {
                                id: 0,
                                name: "Drainage Basin Boundaries",
                                type: "Feature Layer",
                                geometryType: "esriGeometryPolygon",
                            },
                            {
                                id: 1,
                                name: "Hydro Gauge",
                                type: "Group Layer",
                            },
                        ],
                    });
                default:
                    throw new Error(`Unhandled esriRequest: ${url}`);
            }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("collects feature layers when starting from the services root", async () => {
        const analysis = await analyzeArcGISEndpoint(`${rootUrl}/`);
        expect(analysis.endpointType).toBe("directory");

        const traversal = await traverseFeatureLayers(`${rootUrl}/`, analysis);
        expect(traversal.featureLayers).toHaveLength(1);
        expect(traversal.root.folders).toHaveLength(1);
        const hydroFolder = traversal.root.folders[0];
        expect(hydroFolder.displayName).toBe("Hydro");
        expect(hydroFolder.services).toHaveLength(1);
        const service = hydroFolder.services[0];
        expect(service.name).toBe("drainage_basins");
        expect(service.layers).toHaveLength(1);
        expect(service.layers[0].url).toBe(`${drainageServiceUrl}/0`);
    });

    it("collects feature layers when starting from a MapServer", async () => {
        mockedEsriRequest.mockImplementation(async (url: string) => {
            if (url === drainageServiceUrl) {
                return createEsriResponse({
                    layers: [
                        {
                            id: 0,
                            name: "Drainage Basin Boundaries",
                            type: "Feature Layer",
                            geometryType: "esriGeometryPolygon",
                        },
                    ],
                });
            }
            throw new Error(`Unhandled esriRequest: ${url}`);
        });

        const analysis = await analyzeArcGISEndpoint(drainageServiceUrl);
        expect(analysis.endpointType).toBe("service");

        const traversal = await traverseFeatureLayers(drainageServiceUrl, analysis);
        expect(traversal.featureLayers).toHaveLength(1);
        expect(traversal.root.services).toHaveLength(1);
        expect(traversal.root.services[0].layers[0].name).toBe("Drainage Basin Boundaries");
        expect(traversal.featureLayers[0].folderPath).toHaveLength(0);
    });
});

function createEsriResponse<T>(json: T) {
    return { data: json } as { data: T };
}
