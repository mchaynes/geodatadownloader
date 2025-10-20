/**
 * WFS (Web Feature Service) support module
 * Handles querying and downloading features from WFS services
 */

import Geometry from "@arcgis/core/geometry/Geometry";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet";
import Graphic from "@arcgis/core/Graphic";

export interface WFSCapabilities {
  version: string;
  title: string;
  featureTypes: WFSFeatureType[];
  url: string;
}

export interface WFSFeatureType {
  name: string;
  title: string;
  abstract?: string;
  defaultSRS?: string;
  outputFormats?: string[];
  bbox?: {
    minx: number;
    miny: number;
    maxx: number;
    maxy: number;
    srs?: string;
  };
}

export interface WFSLayer {
  url: string;
  typename: string;
  version: string;
  title: string;
  fields: Array<{ name: string; type: string; alias?: string }>;
}

/**
 * Parse WFS URL to extract base URL and typename
 */
export function parseWFSUrl(url: string): { baseUrl: string; typename?: string } {
  const urlObj = new URL(url);
  const params = new URLSearchParams(urlObj.search);
  
  // Extract typename from query params if present
  const typename = params.get("typename") || params.get("typeName") || params.get("TYPENAME");
  
  // Get base URL without query params
  // For OWS endpoints, we want to keep the path but clear query params
  const baseUrl = `${urlObj.origin}${urlObj.pathname}`;
  
  return { baseUrl, typename: typename || undefined };
}

/**
 * Detect if a URL is a WFS endpoint
 */
export function isWFSUrl(url: string): boolean {
  try {
    const lowerUrl = url.toLowerCase();
    // Check for common WFS patterns
    // Note: /ows endpoints (OGC Web Services) can serve both WMS and WFS
    // We'll treat them as WFS if they don't explicitly specify WMS
    const hasWfsIndicator = (
      lowerUrl.includes("/wfs") ||
      lowerUrl.includes("service=wfs") ||
      lowerUrl.includes("request=getcapabilities") ||
      lowerUrl.includes("request=getfeature")
    );
    
    const hasOwsEndpoint = lowerUrl.includes("/ows");
    const hasWmsService = lowerUrl.includes("service=wms");
    
    // If it's an OWS endpoint without explicit WMS service parameter, treat as WFS
    if (hasOwsEndpoint && !hasWmsService) {
      return true;
    }
    
    return hasWfsIndicator;
  } catch {
    return false;
  }
}

/**
 * Fetch and parse WFS GetCapabilities
 */
export async function getWFSCapabilities(baseUrl: string, version = "2.0.0"): Promise<WFSCapabilities> {
  const url = new URL(baseUrl);
  url.searchParams.set("service", "WFS");
  url.searchParams.set("request", "GetCapabilities");
  url.searchParams.set("version", version);

  let response;
  try {
    response = await fetch(url.toString());
  } catch (error) {
    // Check if this is a CORS error
    const err = error as Error;
    if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
      throw new Error(
        `Cannot access WFS service due to CORS restrictions. The server at ${baseUrl} does not allow cross-origin requests. ` +
        `This is a browser security limitation. To use this WFS service, it must be configured to allow CORS, or you may need to use a proxy service.`
      );
    }
    throw new Error(`Failed to fetch WFS capabilities: ${err.message}`);
  }
  
  if (!response.ok) {
    throw new Error(`Failed to fetch WFS capabilities: ${response.statusText}`);
  }

  const text = await response.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "application/xml");

  // Check for service exception
  const exception = xml.querySelector("ServiceException");
  if (exception) {
    throw new Error(`WFS Service Exception: ${exception.textContent}`);
  }

  const featureTypes: WFSFeatureType[] = [];
  const featureTypeElements = xml.querySelectorAll("FeatureType");

  featureTypeElements.forEach((ft) => {
    const name = ft.querySelector("Name")?.textContent || "";
    const title = ft.querySelector("Title")?.textContent || name;
    const abstract = ft.querySelector("Abstract")?.textContent || undefined;
    const defaultSRS = ft.querySelector("DefaultSRS, DefaultCRS")?.textContent || undefined;

    // Parse bounding box
    const bbox = ft.querySelector("WGS84BoundingBox, LatLongBoundingBox");
    let bboxData;
    if (bbox) {
      const lowerCorner = bbox.querySelector("LowerCorner")?.textContent?.split(" ") || [];
      const upperCorner = bbox.querySelector("UpperCorner")?.textContent?.split(" ") || [];
      
      if (lowerCorner.length >= 2 && upperCorner.length >= 2) {
        bboxData = {
          minx: parseFloat(lowerCorner[0]),
          miny: parseFloat(lowerCorner[1]),
          maxx: parseFloat(upperCorner[0]),
          maxy: parseFloat(upperCorner[1]),
        };
      }
    }

    featureTypes.push({
      name,
      title,
      abstract,
      defaultSRS,
      bbox: bboxData,
    });
  });

  const serviceTitle = xml.querySelector("ServiceIdentification Title, Service Title")?.textContent || "WFS Service";

  return {
    version,
    title: serviceTitle,
    featureTypes,
    url: baseUrl,
  };
}

/**
 * Get feature count for a WFS layer
 */
export async function getWFSFeatureCount(
  layer: WFSLayer,
  filterExtent?: Geometry
): Promise<number> {
  const url = new URL(layer.url);
  url.searchParams.set("service", "WFS");
  url.searchParams.set("version", layer.version);
  url.searchParams.set("request", "GetFeature");
  url.searchParams.set("typename", layer.typename);
  url.searchParams.set("resultType", "hits");

  // Add bbox filter if extent is provided
  if (filterExtent && filterExtent.extent) {
    const { xmin, ymin, xmax, ymax } = filterExtent.extent;
    url.searchParams.set("bbox", `${xmin},${ymin},${xmax},${ymax}`);
  }

  let response;
  try {
    response = await fetch(url.toString());
  } catch (error) {
    const err = error as Error;
    if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
      throw new Error(`Cannot access WFS service due to CORS restrictions. The server does not allow cross-origin requests.`);
    }
    throw new Error(`Failed to get feature count: ${err.message}`);
  }
  
  if (!response.ok) {
    throw new Error(`Failed to get feature count: ${response.statusText}`);
  }

  const text = await response.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "application/xml");

  // Try different ways to get the count
  const featureCollection = xml.querySelector("FeatureCollection");
  if (featureCollection) {
    const countAttr = featureCollection.getAttribute("numberMatched") || 
                      featureCollection.getAttribute("numberOfFeatures");
    if (countAttr) {
      return parseInt(countAttr, 10);
    }
  }

  // Fallback: count features manually if hits not supported
  return xml.querySelectorAll("featureMember, member").length;
}

/**
 * Query WFS layer for features
 */
export async function queryWFSFeatures(
  layer: WFSLayer,
  options: {
    startIndex?: number;
    maxFeatures?: number;
    filterExtent?: Geometry;
    outFields?: string[];
  } = {}
): Promise<FeatureSet> {
  const { startIndex = 0, maxFeatures = 1000, filterExtent, outFields } = options;

  const url = new URL(layer.url);
  url.searchParams.set("service", "WFS");
  url.searchParams.set("version", layer.version);
  url.searchParams.set("request", "GetFeature");
  url.searchParams.set("typename", layer.typename);
  url.searchParams.set("outputFormat", "application/json");
  url.searchParams.set("srsName", "EPSG:4326");

  if (maxFeatures > 0) {
    // WFS 2.0 uses count, WFS 1.x uses maxFeatures
    if (layer.version.startsWith("2")) {
      url.searchParams.set("count", maxFeatures.toString());
      url.searchParams.set("startIndex", startIndex.toString());
    } else {
      url.searchParams.set("maxFeatures", maxFeatures.toString());
      url.searchParams.set("startIndex", startIndex.toString());
    }
  }

  // Add bbox filter if extent is provided
  if (filterExtent && filterExtent.extent) {
    const { xmin, ymin, xmax, ymax } = filterExtent.extent;
    url.searchParams.set("bbox", `${xmin},${ymin},${xmax},${ymax},EPSG:4326`);
  }

  // Add property names if specific fields requested
  if (outFields && outFields.length > 0 && !outFields.includes("*")) {
    url.searchParams.set("propertyName", outFields.join(","));
  }

  let response;
  try {
    response = await fetch(url.toString());
  } catch (error) {
    const err = error as Error;
    if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
      throw new Error(`Cannot access WFS service due to CORS restrictions. The server does not allow cross-origin requests.`);
    }
    throw new Error(`WFS GetFeature failed: ${err.message}`);
  }
  
  if (!response.ok) {
    throw new Error(`WFS GetFeature failed: ${response.statusText}`);
  }

  const geojson = await response.json();

  // Convert GeoJSON to FeatureSet
  return geojsonToFeatureSet(geojson);
}

/**
 * Convert GeoJSON FeatureCollection to ArcGIS FeatureSet
 */
function geojsonToFeatureSet(geojson: any): FeatureSet {
  const features = (geojson.features || []).map((feature: any) => {
    return new Graphic({
      geometry: convertGeoJSONGeometry(feature.geometry),
      attributes: feature.properties || {},
    });
  });

  return new FeatureSet({
    features,
    spatialReference: { wkid: 4326 }, // GeoJSON is always WGS84
  });
}

/**
 * Convert GeoJSON geometry to ArcGIS geometry
 */
function convertGeoJSONGeometry(geom: any): any {
  if (!geom) return null;

  const type = geom.type;
  const coords = geom.coordinates;

  switch (type) {
    case "Point":
      return {
        type: "point",
        x: coords[0],
        y: coords[1],
        spatialReference: { wkid: 4326 },
      };
    case "MultiPoint":
      return {
        type: "multipoint",
        points: coords,
        spatialReference: { wkid: 4326 },
      };
    case "LineString":
      return {
        type: "polyline",
        paths: [coords],
        spatialReference: { wkid: 4326 },
      };
    case "MultiLineString":
      return {
        type: "polyline",
        paths: coords,
        spatialReference: { wkid: 4326 },
      };
    case "Polygon":
      return {
        type: "polygon",
        rings: coords,
        spatialReference: { wkid: 4326 },
      };
    case "MultiPolygon":
      return {
        type: "polygon",
        rings: coords.flat(),
        spatialReference: { wkid: 4326 },
      };
    default:
      return null;
  }
}

/**
 * WFS Query Results - compatible with ArcGIS QueryResults interface
 */
export class WFSQueryResults {
  private layer: WFSLayer;
  private where: string;
  private queryExtent?: Geometry;
  private pageSize: number;
  private totalCount?: number;

  constructor(layer: WFSLayer, where: string, queryExtent?: Geometry, pageSize = 1000) {
    this.layer = layer;
    this.where = where;
    this.queryExtent = queryExtent;
    this.pageSize = pageSize;
  }

  async getPage(page: number, outFields?: string[]): Promise<FeatureSet> {
    const startIndex = page * this.pageSize;
    return queryWFSFeatures(this.layer, {
      startIndex,
      maxFeatures: this.pageSize,
      filterExtent: this.queryExtent,
      outFields,
    });
  }

  async getTotalCount(): Promise<number> {
    if (this.totalCount === undefined) {
      this.totalCount = await getWFSFeatureCount(this.layer, this.queryExtent);
    }
    return this.totalCount;
  }

  async getNumPages(): Promise<number> {
    const total = await this.getTotalCount();
    return Math.ceil(total / this.pageSize);
  }

  getLayer() {
    return this.layer;
  }

  getPageSize() {
    return this.pageSize;
  }
}

/**
 * Load a WFS layer from URL
 */
export async function loadWFSLayer(url: string): Promise<WFSLayer> {
  const { baseUrl, typename } = parseWFSUrl(url);
  
  // Try to get capabilities to find feature types
  let capabilities: WFSCapabilities;
  try {
    capabilities = await getWFSCapabilities(baseUrl);
  } catch (error) {
    // If capabilities fail, try version 1.1.0
    try {
      capabilities = await getWFSCapabilities(baseUrl, "1.1.0");
    } catch {
      // If still failing, try 1.0.0
      capabilities = await getWFSCapabilities(baseUrl, "1.0.0");
    }
  }

  // If typename not in URL, use first available feature type
  let featureTypeName = typename;
  if (!featureTypeName && capabilities.featureTypes.length > 0) {
    featureTypeName = capabilities.featureTypes[0].name;
  }

  if (!featureTypeName) {
    throw new Error("No feature type found in WFS service");
  }

  const featureType = capabilities.featureTypes.find(ft => ft.name === featureTypeName);
  const title = featureType?.title || featureTypeName;

  // Get field information via DescribeFeatureType
  const fields = await describeWFSFeatureType(baseUrl, featureTypeName, capabilities.version);

  return {
    url: baseUrl,
    typename: featureTypeName,
    version: capabilities.version,
    title,
    fields,
  };
}

/**
 * Get field information for a WFS feature type
 */
async function describeWFSFeatureType(
  baseUrl: string,
  typename: string,
  version: string
): Promise<Array<{ name: string; type: string; alias?: string }>> {
  const url = new URL(baseUrl);
  url.searchParams.set("service", "WFS");
  url.searchParams.set("version", version);
  url.searchParams.set("request", "DescribeFeatureType");
  url.searchParams.set("typename", typename);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      // Fallback to empty fields if DescribeFeatureType not supported
      return [];
    }

    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "application/xml");

    const fields: Array<{ name: string; type: string; alias?: string }> = [];
    const elements = xml.querySelectorAll("element[name], xsd\\:element[name]");

    elements.forEach((el) => {
      const name = el.getAttribute("name");
      const type = el.getAttribute("type") || "string";
      if (name && name !== "geometry" && name !== "geom") {
        fields.push({
          name,
          type: mapXSDTypeToFieldType(type),
        });
      }
    });

    return fields;
  } catch {
    // Return empty array if describe fails
    return [];
  }
}

/**
 * Map XSD types to field types
 */
function mapXSDTypeToFieldType(xsdType: string): string {
  const cleanType = xsdType.replace(/^.*:/, "").toLowerCase();
  
  if (cleanType.includes("int") || cleanType.includes("long") || cleanType.includes("short")) {
    return "integer";
  }
  if (cleanType.includes("double") || cleanType.includes("float") || cleanType.includes("decimal")) {
    return "double";
  }
  if (cleanType.includes("date") || cleanType.includes("time")) {
    return "date";
  }
  if (cleanType.includes("bool")) {
    return "boolean";
  }
  
  return "string";
}
