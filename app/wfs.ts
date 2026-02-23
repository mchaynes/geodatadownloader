const WFS_PAGE_SIZE = 1000;

export type WfsCapabilities = {
  version: string;
  featureTypes: WfsFeatureType[];
  serviceTitle?: string;
};

export type WfsFeatureType = {
  name: string;
  title?: string;
  abstract?: string;
  defaultCrs?: string;
};

/**
 * Returns true if the URL looks like a WFS endpoint:
 *   - query param service=WFS (case-insensitive), OR
 *   - path ends with /wfs or /ows
 */
export function isWfsUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    const serviceParam = url.searchParams.get("service");
    if (serviceParam && serviceParam.toUpperCase() === "WFS") {
      return true;
    }
    const path = url.pathname.toLowerCase().replace(/\/+$/, "");
    if (path.endsWith("/wfs") || path.endsWith("/ows")) {
      return true;
    }
  } catch {
    // Not a valid URL
  }
  return false;
}

/** Strips query params and hash from a WFS URL, returning just the base endpoint. */
export function normalizeWfsBaseUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    return url.origin + url.pathname;
  } catch {
    return rawUrl.split("?")[0];
  }
}

/** Fetches and parses WFS GetCapabilities XML, returning version + feature type list. */
export async function fetchWfsCapabilities(baseUrl: string): Promise<WfsCapabilities> {
  const url = `${baseUrl}?service=WFS&request=GetCapabilities`;
  let response: Response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new Error(`Unable to reach WFS endpoint: ${(err as Error).message}`);
  }

  if (!response.ok) {
    throw new Error(`WFS GetCapabilities failed: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "application/xml");

  if (doc.querySelector("parsererror")) {
    throw new Error("Failed to parse WFS GetCapabilities response as XML");
  }

  // Check for WFS exception report
  const exceptionText =
    doc.querySelector("ExceptionReport ExceptionText, ExceptionText")?.textContent?.trim() ??
    doc.querySelector("ows\\:ExceptionReport ows\\:ExceptionText")?.textContent?.trim();
  if (exceptionText) {
    throw new Error(`WFS service error: ${exceptionText}`);
  }

  const root = doc.documentElement;
  const version = root.getAttribute("version") ?? "2.0.0";

  const serviceTitle =
    doc.querySelector("ServiceIdentification Title")?.textContent?.trim() ??
    doc.querySelector("Service Title")?.textContent?.trim();

  const featureTypes: WfsFeatureType[] = [];
  doc.querySelectorAll("FeatureTypeList FeatureType").forEach((ft) => {
    const name = ft.querySelector("Name")?.textContent?.trim();
    if (!name) return;
    featureTypes.push({
      name,
      title: ft.querySelector("Title")?.textContent?.trim(),
      abstract: ft.querySelector("Abstract")?.textContent?.trim(),
      defaultCrs:
        ft.querySelector("DefaultCRS")?.textContent?.trim() ??
        ft.querySelector("DefaultSRS")?.textContent?.trim() ??
        ft.querySelector("SRS")?.textContent?.trim(),
    });
  });

  if (featureTypes.length === 0) {
    throw new Error("No feature types found in WFS GetCapabilities response");
  }

  return { version, featureTypes, serviceTitle };
}

export type WfsGeoJsonPageResult = {
  features: GeoJSON.Feature[];
  totalCount?: number;
};

/** Fetches one page of WFS features as GeoJSON, adapting params per WFS version. */
export async function fetchWfsGeoJsonPage(
  baseUrl: string,
  typeName: string,
  version: string,
  pageSize: number,
  startIndex: number,
): Promise<WfsGeoJsonPageResult> {
  const majorVersion = parseInt(version.split(".")[0] ?? "2", 10);
  const minorVersion = parseInt(version.split(".")[1] ?? "0", 10);

  // WFS 1.0 has no startIndex — only fetch the first page
  if (majorVersion === 1 && minorVersion === 0 && startIndex > 0) {
    return { features: [] };
  }

  const params = new URLSearchParams({
    service: "WFS",
    version,
    request: "GetFeature",
    outputFormat: "application/json",
  });

  if (majorVersion >= 2) {
    params.set("typeNames", typeName);
    params.set("count", String(pageSize));
    params.set("startIndex", String(startIndex));
  } else if (majorVersion === 1 && minorVersion >= 1) {
    params.set("typeName", typeName);
    params.set("maxFeatures", String(pageSize));
    params.set("startIndex", String(startIndex));
  } else {
    // WFS 1.0
    params.set("typeName", typeName);
    params.set("maxFeatures", String(pageSize));
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}?${params.toString()}`);
  } catch (err) {
    throw new Error(`WFS GetFeature request failed: ${(err as Error).message}`);
  }

  if (!response.ok) {
    throw new Error(`WFS GetFeature failed: ${response.status} ${response.statusText}`);
  }

  const json = await response.json() as GeoJSON.FeatureCollection & {
    totalFeatures?: number;
    numberMatched?: number;
  };

  if (!Array.isArray(json.features)) {
    throw new Error("WFS server did not return a GeoJSON FeatureCollection");
  }

  const totalCount = json.totalFeatures ?? json.numberMatched;
  return { features: json.features, totalCount: typeof totalCount === "number" ? totalCount : undefined };
}

/** Gets total feature count via resultType=hits (WFS 2.0 only). Returns null if unsupported. */
export async function getWfsTotalCount(
  baseUrl: string,
  typeName: string,
  version: string,
): Promise<number | null> {
  const majorVersion = parseInt(version.split(".")[0] ?? "2", 10);
  if (majorVersion < 2) return null;

  try {
    const params = new URLSearchParams({
      service: "WFS",
      version,
      request: "GetFeature",
      typeNames: typeName,
      resultType: "hits",
    });
    const response = await fetch(`${baseUrl}?${params.toString()}`);
    if (!response.ok) return null;
    const text = await response.text();
    const doc = new DOMParser().parseFromString(text, "application/xml");
    const root = doc.documentElement;
    const matched = root.getAttribute("numberMatched") ?? root.getAttribute("numberOfFeatures");
    if (matched && matched !== "unknown") {
      const n = parseInt(matched, 10);
      return isNaN(n) ? null : n;
    }
  } catch {
    // Ignore errors — total count is optional
  }
  return null;
}

/**
 * Fetches all features for a WFS layer by paginating GetFeature requests.
 * Returns a complete GeoJSON FeatureCollection string.
 */
export async function fetchAllWfsFeatures(
  baseUrl: string,
  typeName: string,
  version: string,
  onProgress?: (fetched: number, total?: number) => void,
): Promise<string> {
  const allFeatures: GeoJSON.Feature[] = [];
  let startIndex = 0;
  let totalCount: number | undefined;

  const prefetched = await getWfsTotalCount(baseUrl, typeName, version);
  if (prefetched !== null) totalCount = prefetched;

  while (true) {
    const { features, totalCount: pageTotal } = await fetchWfsGeoJsonPage(
      baseUrl, typeName, version, WFS_PAGE_SIZE, startIndex,
    );

    if (typeof pageTotal === "number" && totalCount === undefined) {
      totalCount = pageTotal;
    }

    allFeatures.push(...features);
    onProgress?.(allFeatures.length, totalCount);

    if (features.length < WFS_PAGE_SIZE) break;
    startIndex += WFS_PAGE_SIZE;
  }

  return JSON.stringify({ type: "FeatureCollection", features: allFeatures });
}
