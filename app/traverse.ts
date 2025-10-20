import esriRequest from "@arcgis/core/request";
import { assertNoArcGISError } from "./arcgis";

const FEATURE_LAYER_TYPE = "Feature Layer";
const SUPPORTED_SERVICE_TYPES = new Set(["MapServer", "FeatureServer"]);

export type ArcGISEndpointType = "feature-layer" | "service" | "directory";

export interface ArcGISEndpointAnalysis {
  normalizedUrl: string;
  servicesBaseUrl: string;
  relativePathSegments: string[];
  endpointType: ArcGISEndpointType;
  json: Record<string, unknown>;
}

export interface ArcGISFeatureLayerNode {
  id: number;
  name: string;
  type: string;
  url: string;
  geometryType?: string;
  description?: string;
}

export interface ArcGISServiceNode {
  name: string;
  fullName: string;
  type: string;
  url: string;
  folderPathFromServicesRoot: string[];
  folderPathRelativeToStart: string[];
  layers: ArcGISFeatureLayerNode[];
}

export interface ArcGISFolderNode {
  name: string;
  displayName: string;
  url: string;
  pathFromServicesRoot: string[];
  pathRelativeToStart: string[];
  folders: ArcGISFolderNode[];
  services: ArcGISServiceNode[];
  isVirtualRoot: boolean;
}

export interface ArcGISFeatureLayerEntry {
  folderPath: string[];
  folderPathFromServicesRoot: string[];
  service: ArcGISServiceNode;
  layer: ArcGISFeatureLayerNode;
}

export interface ArcGISTraversalResult {
  endpointType: Exclude<ArcGISEndpointType, "feature-layer">;
  root: ArcGISFolderNode;
  featureLayers: ArcGISFeatureLayerEntry[];
  servicesBaseUrl: string;
  startFolderPath: string[];
  analyzedUrl: string;
}

type ArcGISDirectoryJson = {
  folders?: string[];
  services?: { name: string; type: string }[];
};

type ArcGISServiceJson = {
  layers?: ArcGISServiceLayerSummary[];
};

type ArcGISServiceLayerSummary = {
  id: number;
  name: string;
  type: string;
  geometryType?: string;
  description?: string;
};

type TraversalContext = {
  servicesBaseUrl: string;
  startFolderPath: string[];
  root: ArcGISFolderNode;
  featureLayerEntries: ArcGISFeatureLayerEntry[];
};

export async function analyzeArcGISEndpoint(
  rawUrl: string
): Promise<ArcGISEndpointAnalysis> {
  const normalizedUrl = normalizeArcGisUrl(rawUrl);
  const { servicesBaseUrl, relativePathSegments } = extractServicesBaseAndPath(
    normalizedUrl
  );

  const json = await fetchArcGISJson(normalizedUrl);
  const endpointType = detectEndpointType(json);

  return {
    normalizedUrl,
    servicesBaseUrl,
    relativePathSegments,
    endpointType,
    json,
  };
}

export async function traverseFeatureLayers(
  rawUrl: string,
  analysis?: ArcGISEndpointAnalysis
): Promise<ArcGISTraversalResult> {
  const resolvedAnalysis = analysis ?? (await analyzeArcGISEndpoint(rawUrl));
  if (resolvedAnalysis.endpointType === "feature-layer") {
    throw new Error(
      "Expected a folder or service URL. Received a feature layer URL instead."
    );
  }

  const startFolderPath = deriveStartFolderPath(resolvedAnalysis);
  const context: TraversalContext = {
    servicesBaseUrl: resolvedAnalysis.servicesBaseUrl,
    startFolderPath,
    root: createRootFolderNode(
      resolvedAnalysis.servicesBaseUrl,
      startFolderPath
    ),
    featureLayerEntries: [],
  };

  if (resolvedAnalysis.endpointType === "directory") {
    await traverseDirectory(
      resolvedAnalysis.normalizedUrl,
      resolvedAnalysis.relativePathSegments.slice(),
      resolvedAnalysis.json as ArcGISDirectoryJson,
      context
    );
  } else {
    await traverseServiceFromAnalysis(resolvedAnalysis, context);
  }

  sortFolderTree(context.root);

  return {
    endpointType: resolvedAnalysis.endpointType,
    root: context.root,
    featureLayers: context.featureLayerEntries,
    servicesBaseUrl: resolvedAnalysis.servicesBaseUrl,
    startFolderPath,
    analyzedUrl: resolvedAnalysis.normalizedUrl,
  };
}

async function traverseDirectory(
  url: string,
  folderPathFromServicesRoot: string[],
  existingJson: ArcGISDirectoryJson | undefined,
  context: TraversalContext
): Promise<void> {
  const directoryJson = existingJson ?? (await fetchArcGISJson<ArcGISDirectoryJson>(url));
  const folderNode = ensureFolderNode(context, folderPathFromServicesRoot);

  const services = directoryJson.services ?? [];
  for (const service of services) {
    if (!service?.name || !service?.type) {
      continue;
    }
    if (!SUPPORTED_SERVICE_TYPES.has(service.type)) {
      continue;
    }
    const serviceNameParts = splitServiceName(service.name);
    if (!serviceNameParts.length) {
      continue;
    }
    const serviceName = serviceNameParts[serviceNameParts.length - 1];
    const serviceFolderPath = serviceNameParts.slice(0, -1);
    if (!pathsEqual(serviceFolderPath, folderPathFromServicesRoot)) {
      continue;
    }
    await collectServiceLayers(
      serviceName,
      service.type,
      serviceFolderPath,
      context,
      folderNode,
      undefined
    );
  }

  const childFolders = directoryJson.folders ?? [];
  for (const childFolder of childFolders) {
    const childFolderPath = [...folderPathFromServicesRoot, childFolder];
    const childUrl = buildArcGISEndpointUrl(
      context.servicesBaseUrl,
      childFolderPath
    );
    await traverseDirectory(childUrl, childFolderPath, undefined, context);
  }
}

async function traverseServiceFromAnalysis(
  analysis: ArcGISEndpointAnalysis,
  context: TraversalContext
): Promise<void> {
  const serviceType = analysis.relativePathSegments.at(-1);
  if (!serviceType || !SUPPORTED_SERVICE_TYPES.has(serviceType)) {
    throw new Error(
      `Unsupported ArcGIS service type: ${serviceType ?? "unknown"}`
    );
  }

  const servicePathParts = analysis.relativePathSegments.slice(0, -1);
  if (!servicePathParts.length) {
    throw new Error("Unable to determine service name from URL");
  }
  const serviceName = servicePathParts[servicePathParts.length - 1];
  const folderPathFromServicesRoot = servicePathParts.slice(0, -1);
  const folderNode = ensureFolderNode(context, folderPathFromServicesRoot);

  await collectServiceLayers(
    serviceName,
    serviceType,
    folderPathFromServicesRoot,
    context,
    folderNode,
    analysis.json as ArcGISServiceJson
  );
}

async function collectServiceLayers(
  serviceName: string,
  serviceType: string,
  folderPathFromServicesRoot: string[],
  context: TraversalContext,
  folderNode: ArcGISFolderNode,
  preload?: ArcGISServiceJson
): Promise<void> {
  const servicePath = [...folderPathFromServicesRoot, serviceName];
  const serviceUrl = buildArcGISEndpointUrl(context.servicesBaseUrl, [
    ...servicePath,
    serviceType,
  ]);
  const serviceJson = preload ?? (await fetchArcGISJson<ArcGISServiceJson>(serviceUrl));
  const candidateLayers = serviceJson.layers ?? [];
  const featureLayerSummaries = candidateLayers.filter(
    (layer) => layer.type === FEATURE_LAYER_TYPE && layer.id !== undefined
  );

  if (!featureLayerSummaries.length) {
    return;
  }

  const relativeFolderPath = folderPathFromServicesRoot.slice(
    context.startFolderPath.length
  );
  const serviceNode: ArcGISServiceNode = {
    name: serviceName,
    fullName: servicePath.join("/"),
    type: serviceType,
    url: serviceUrl,
    folderPathFromServicesRoot: folderPathFromServicesRoot.slice(),
    folderPathRelativeToStart: relativeFolderPath,
    layers: [],
  };

  for (const layerSummary of featureLayerSummaries) {
    const id = layerSummary.id;

    const layerUrl = pathJoin([serviceUrl, `${id}`]);
    const layerNode: ArcGISFeatureLayerNode = {
      id,
      name: layerSummary.name,
      type: layerSummary.type,
      url: layerUrl,
      geometryType: layerSummary.geometryType,
      description: layerSummary.description,
    };

    serviceNode.layers.push(layerNode);
    context.featureLayerEntries.push({
      folderPath: relativeFolderPath,
      folderPathFromServicesRoot: folderPathFromServicesRoot.slice(),
      service: serviceNode,
      layer: layerNode,
    });
  }

  if (!serviceNode.layers.length) {
    return;
  }

  folderNode.services.push(serviceNode);
}

function ensureFolderNode(
  context: TraversalContext,
  folderPathFromServicesRoot: string[]
): ArcGISFolderNode {
  const relativeFolderPath = folderPathFromServicesRoot.slice(
    context.startFolderPath.length
  );
  let current = context.root;
  const absolutePath = context.startFolderPath.slice();
  const relativePath: string[] = [];

  for (const segment of relativeFolderPath) {
    absolutePath.push(segment);
    relativePath.push(segment);
    let child = current.folders.find((f) => f.name === segment);
    if (!child) {
      child = {
        name: segment,
        displayName: segment,
        url: buildArcGISEndpointUrl(context.servicesBaseUrl, absolutePath),
        pathFromServicesRoot: absolutePath.slice(),
        pathRelativeToStart: relativePath.slice(),
        folders: [],
        services: [],
        isVirtualRoot: false,
      };
      current.folders.push(child);
    }
    current = child;
  }

  return current;
}

function deriveStartFolderPath(
  analysis: ArcGISEndpointAnalysis
): string[] {
  if (analysis.endpointType === "directory") {
    return analysis.relativePathSegments.slice();
  }

  const serviceType = analysis.relativePathSegments.at(-1);
  if (!serviceType) {
    return [];
  }
  const servicePathParts = analysis.relativePathSegments.slice(0, -1);
  if (!servicePathParts.length) {
    return [];
  }
  return servicePathParts.slice(0, -1);
}

function createRootFolderNode(
  servicesBaseUrl: string,
  startFolderPath: string[]
): ArcGISFolderNode {
  const displayName = startFolderPath.length
    ? startFolderPath[startFolderPath.length - 1]
    : "Root";
  return {
    name: displayName,
    displayName,
    url: buildArcGISEndpointUrl(servicesBaseUrl, startFolderPath),
    pathFromServicesRoot: startFolderPath.slice(),
    pathRelativeToStart: [],
    folders: [],
    services: [],
    isVirtualRoot: startFolderPath.length === 0,
  };
}

function detectEndpointType(json: Record<string, unknown>): ArcGISEndpointType {
  const maybeType = typeof json.type === "string" ? json.type : undefined;
  if (maybeType === FEATURE_LAYER_TYPE) {
    return "feature-layer";
  }

  if (Array.isArray((json as ArcGISServiceJson).layers)) {
    return "service";
  }

  if (Array.isArray((json as ArcGISDirectoryJson).services) || Array.isArray((json as ArcGISDirectoryJson).folders)) {
    return "directory";
  }

  throw new Error("Unable to determine ArcGIS endpoint type from response");
}

async function fetchArcGISJson<T = Record<string, unknown>>(
  url: string
): Promise<T> {
  try {
    const { data } = await esriRequest(url, {
      responseType: "json",
      query: { f: "json" },
      timeout: 60000,
    });
    const json = data as T;
    assertNoArcGISError(json, url);
    return json;
  } catch (error) {
    const err = error as Error & { details?: { message?: string } };
    const msg = err?.details?.message ?? err.message ?? "Unknown ArcGIS request error";
    throw new Error(`Failed to fetch ${url}: ${msg}`);
  }
}

function normalizeArcGisUrl(rawUrl: string): string {
  if (!rawUrl || !rawUrl.trim()) {
    throw new Error("A URL is required");
  }
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch (error) {
    throw new Error(`Invalid URL: ${rawUrl}`);
  }
  parsed.search = "";
  parsed.hash = "";
  return `${parsed.origin}${parsed.pathname}`;
}

function extractServicesBaseAndPath(url: string) {
  const parsed = new URL(url);
  const target = "/rest/services";
  const index = parsed.pathname.toLowerCase().indexOf(target);
  if (index === -1) {
    throw new Error("The provided URL does not reference an ArcGIS REST services endpoint.");
  }
  const basePath = parsed.pathname.slice(0, index + target.length);
  const remainder = parsed.pathname.slice(index + target.length);
  const relativePathSegments = remainder
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));

  return {
    servicesBaseUrl: `${parsed.origin}${basePath}`,
    relativePathSegments,
  };
}

function splitServiceName(serviceName: string): string[] {
  return serviceName
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function pathsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((segment, index) => segment === b[index]);
}

function buildArcGISEndpointUrl(base: string, parts: string[]): string {
  if (!parts.length) {
    return base;
  }
  return pathJoin([base, ...parts]);
}

function sortFolderTree(node: ArcGISFolderNode): void {
  node.folders.sort((a, b) =>
    a.displayName.localeCompare(b.displayName, undefined, {
      sensitivity: "base",
    })
  );
  node.services.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
  for (const service of node.services) {
    service.layers.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  }
  for (const folder of node.folders) {
    sortFolderTree(folder);
  }
}

// https://stackoverflow.com/a/55142565/18094166
function pathJoin(parts: string[]) {
  const separator = "/";
  const sanitized = parts.map((part, index) => {
    let updatedPart = part;
    if (index) {
      updatedPart = updatedPart.replace(new RegExp("^" + separator), "");
    }
    if (index !== parts.length - 1) {
      updatedPart = updatedPart.replace(new RegExp(separator + "$"), "");
    }
    return updatedPart;
  });
  return sanitized.join(separator);
}

export default traverseFeatureLayers;
