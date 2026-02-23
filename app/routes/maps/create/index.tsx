import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { getQueryParameter } from "../../../url";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getRealUrl, queryLayer, QueryResult } from "../../../arcgis";
import Geometry from "@arcgis/core/geometry/Geometry";
import Extent from "@arcgis/core/geometry/Extent";
import { ActionFunctionArgs, Form, Link, Outlet, useFetcher, useLoaderData } from "react-router-dom";
import { Button, Checkbox, Dropdown, Modal, Table, TextInput } from "flowbite-react";
import { Drivers } from "../../../downloader";
import { StatusAlert, useStatusAlert } from "../../../StatusAlert";
import { getMapConfigLocal, getMapConfigSync, saveMapConfigLocal } from "../../../database";
import { cleanArcGISUrl } from "../../../utils/urlCleaning";

import { HiOutlineExclamationCircle, HiOutlineArrowCircleDown } from "react-icons/hi";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet";
import { EsriLayerWithConfig, raise, isWfsLayer, isArcGisLayer } from "../../../types";
import {
  analyzeArcGISEndpoint,
  traverseFeatureLayers,
  ArcGISTraversalResult,
  ArcGISServiceNode,
  ArcGISFolderNode,
  ArcGISFeatureLayerNode,
} from "../../../traverse";
import WFSLayer from "@arcgis/core/layers/WFSLayer";
import {
  isWfsUrl,
  normalizeWfsBaseUrl,
  fetchWfsCapabilities,
  WfsCapabilities,
  WfsFeatureType,
} from "../../../wfs";
import { Dialog, Transition } from "@headlessui/react";
import { useMapView, MapViewProvider } from "../../../MapViewContext";

type SupportedExportType = string;

function isSupportedExportType(
  value: string | null
): value is SupportedExportType {
  return (
    typeof value === "string" &&
    ["gpkg", "geojson", "csv", "shp"].includes(value)
  );
}

export const mapCreatorAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const mapConfig = await getMapConfigLocal()

  let errMsg = ""
  if (formData.get("intent") === "add-layer") {
    const layerUrl = formData.get("layer-url") as string
    const normalizedInput = cleanArcGISUrl(layerUrl)
    const looksLikeFeatureLayer = /(MapServer|FeatureServer)\/\d+$/.test(normalizedInput)
    if (!looksLikeFeatureLayer) {
      // Block adding service roots or non-feature-layer endpoints via direct submit
      return {
        layers: [],
        mapConfig,
        err: "Please select a specific Feature Layer (e.g., …/MapServer/11). Service roots cannot be added.",
      }
    }
    let layer: FeatureLayer | undefined = undefined
    if (!mapConfig.layers.find(l => cleanArcGISUrl(l.url) === normalizedInput)) {
      try {
        layer = new FeatureLayer({
          url: normalizedInput,
        });
        await layer.load();
        // Ensure we persist the canonical layer URL (with layerId, no trailing slash)
        const realUrl = cleanArcGISUrl(getRealUrl(layer))
        mapConfig.layers.push({
          url: realUrl,
          name: layer.sourceJSON["name"],
          description: layer.sourceJSON["description"],
          extent: layer.fullExtent,
          fields: JSON.stringify(layer.fields),
          geometry_type: layer.geometryType,
          spatial_ref: `${layer.spatialReference.wkid}`,
          visible: true,
        })
        saveMapConfigLocal(mapConfig)
      } catch (e) {
        const err = e as Error;
        errMsg = err.message
      }
    }
  }
  if (formData.get("intent") === "add-wfs-layer") {
    const wfsUrl = formData.get("wfs-url") as string;
    const typeName = formData.get("wfs-type-name") as string;
    const version = formData.get("wfs-version") as string;
    const title = formData.get("wfs-title") as string;
    if (!mapConfig.layers.find(l => l.url === wfsUrl && l.wfs_type_name === typeName)) {
      mapConfig.layers.push({
        url: wfsUrl,
        name: typeName,
        description: "",
        extent: null,
        fields: "[]",
        geometry_type: "",
        spatial_ref: "",
        service_type: "wfs",
        wfs_type_name: typeName,
        wfs_version: version,
        wfs_title: title,
        visible: true,
      });
      saveMapConfigLocal(mapConfig);
    }
  }

  // Build esri layer objects for each saved layer
  const esriLayers: Array<FeatureLayer | WFSLayer> = [];
  const promises: Promise<void>[] = [];
  for (const savedLayer of mapConfig.layers) {
    if (savedLayer.service_type === "wfs") {
      const wfsLayer = new WFSLayer({ url: savedLayer.url, name: savedLayer.wfs_type_name, title: savedLayer.wfs_title || savedLayer.name });
      esriLayers.push(wfsLayer);
      promises.push(wfsLayer.load().catch(() => { /* broken WFS layers are surfaced separately */ }));
    } else {
      const layer = new FeatureLayer({ url: savedLayer.url });
      esriLayers.push(layer);
      promises.push(layer.load());
    }
  }
  try {
    await Promise.all(promises);
  } catch (e) {
    const err = e as Error;
    errMsg = err.message;
  }
  const normalizeUrl = (u: string) => (u ?? "").replace(/\/+$/, "");
  const esriWithConfig = esriLayers.map((esri) => {
    const config = mapConfig.layers.find((l) => {
      if (l.service_type === "wfs") {
        return l.url === esri.url;
      }
      return normalizeUrl(l.url) === normalizeUrl(getRealUrl(esri as FeatureLayer));
    });
    return { esri, config };
  });


  return {
    layers: esriWithConfig,
    mapConfig: mapConfig,
    err: errMsg,
  }
}

export const mapCreatorLoader = async () => {
  const mapConfig = await getMapConfigLocal();
  const esriLayers: Array<FeatureLayer | WFSLayer> = [];
  let errMsg = "";
  const promises: Promise<void>[] = [];

  for (const savedLayer of mapConfig.layers) {
    if (savedLayer.service_type === "wfs") {
      const wfsLayer = new WFSLayer({ url: savedLayer.url, name: savedLayer.wfs_type_name, title: savedLayer.wfs_title || savedLayer.name });
      esriLayers.push(wfsLayer);
      promises.push(wfsLayer.load());
    } else {
      const layer = new FeatureLayer({ url: savedLayer.url });
      esriLayers.push(layer);
      promises.push(layer.load());
    }
  }

  const results = await Promise.allSettled(promises);
  const brokenLayers: Array<{ url: string; name?: string; reason: string }> = [];
  results.forEach((res, idx) => {
    if (res.status === "rejected") {
      const saved = mapConfig.layers[idx];
      const reason = (res.reason as Error)?.message ?? "Failed to load layer";
      brokenLayers.push({ url: saved.url, name: saved.wfs_title ?? saved.name, reason });
    }
  });
  if (brokenLayers.length && !errMsg) {
    errMsg = "One or more layers failed to load.";
  }
  const normalizeUrl = (u: string) => (u ?? "").replace(/\/+$/, "");
  const okLayers = esriLayers.filter((_, idx) => results[idx]?.status === "fulfilled");
  const esriWithConfig = okLayers.map((esri) => {
    const config = mapConfig.layers.find((l) => {
      if (l.service_type === "wfs") return l.url === esri.url;
      return normalizeUrl(l.url) === normalizeUrl(getRealUrl(esri as FeatureLayer));
    });
    return { esri, config };
  });
  return {
    mapConfig,
    layers: esriWithConfig,
    brokenLayers,
    err: errMsg,
  };
}

export default function MapCreator() {

  const queryParam = useMemo(() => getQueryParameter("format"), []);

  const loaderData = useLoaderData() as Awaited<ReturnType<typeof mapCreatorLoader>>
  const [showBrokenModal, setShowBrokenModal] = useState((loaderData?.brokenLayers?.length ?? 0) > 0)
  const [broken, setBroken] = useState<Array<{ url: string; name?: string; reason: string }>>(loaderData?.brokenLayers ?? [])
  const [retryingBrokenCheck, setRetryingBrokenCheck] = useState(false)

  const handleRetryBrokenCheck = useCallback(async () => {
    if (!broken?.length) {
      setShowBrokenModal(false)
      return;
    }
    setRetryingBrokenCheck(true)
    try {
      const checks = await Promise.allSettled(
        broken.map(b => {
          const lyr = new FeatureLayer({ url: b.url })
          return lyr.load()
        })
      )
      const stillBroken: Array<{ url: string; name?: string; reason: string }> = []
      checks.forEach((res, idx) => {
        if (res.status === "rejected") {
          const err = res.reason as Error
          const prev = broken[idx]
          stillBroken.push({ ...prev, reason: err?.message ?? prev.reason })
        }
      })
      setBroken(stillBroken)
      if (stillBroken.length === 0) {
        setShowBrokenModal(false)
      }
    } finally {
      setRetryingBrokenCheck(false)
    }
  }, [broken])

  const [layerUrlInput, setLayerUrlInput] = useState("");
  const [layerAlert, setLayerAlert] = useStatusAlert("", undefined);
  const [analyzingUrl, setAnalyzingUrl] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [layerExplorerResult, setLayerExplorerResult] = useState<ArcGISTraversalResult | null>(null);
  const [layerExplorerVisible, setLayerExplorerVisible] = useState(false);

  // WFS explorer state
  const [wfsCapabilities, setWfsCapabilities] = useState<WfsCapabilities | null>(null);
  const [wfsBaseUrl, setWfsBaseUrl] = useState<string>("");
  const [wfsExplorerVisible, setWfsExplorerVisible] = useState(false);

  const [filterExtent, setFilterExtent] = useState<Geometry | undefined>(
    undefined
  );
  const [format, setFormat] = useState<keyof typeof Drivers>("GPKG")
  const [concurrent, setConcurrent] = useState(1)
  const [minZoom, setMinZoom] = useState(0)
  const [maxZoom, setMaxZoom] = useState(14)

  const [results, setResults] = useState<QueryResult[]>([])

  const [showLoadingModal, setShowLoadingModal] = useState(false)
  const fetcher = useFetcher()

  // Panel resize state
  const [leftPanelWidth, setLeftPanelWidth] = useState(320) // 320px = w-80
  const [rightPanelWidth, setRightPanelWidth] = useState(280) // Default width for download panel
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingRight, setIsResizingRight] = useState(false)

  // Handle panel resizing
  const handleMouseMoveLeft = useCallback((e: MouseEvent) => {
    if (isResizingLeft) {
      e.preventDefault();
      const newWidth = Math.max(200, Math.min(600, e.clientX));
      setLeftPanelWidth(newWidth);
    }
  }, [isResizingLeft]);

  const handleMouseMoveRight = useCallback((e: MouseEvent) => {
    if (isResizingRight) {
      e.preventDefault();
      const newWidth = Math.max(200, Math.min(600, window.innerWidth - e.clientX));
      setRightPanelWidth(newWidth);
    }
  }, [isResizingRight]);

  const handleMouseUp = useCallback(() => {
    setIsResizingLeft(false);
    setIsResizingRight(false);
  }, []);

  useEffect(() => {
    if (isResizingLeft || isResizingRight) {
      document.addEventListener('mousemove', handleMouseMoveLeft as any);
      document.addEventListener('mousemove', handleMouseMoveRight as any);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMoveLeft as any);
        document.removeEventListener('mousemove', handleMouseMoveRight as any);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }

    // Ensure the effect callback always returns a cleanup function so all code paths return a value
    return () => { /* noop cleanup */ };
  }, [isResizingLeft, isResizingRight, handleMouseMoveLeft, handleMouseMoveRight, handleMouseUp]);

  // Track visible layer count
  useEffect(() => {
    const updateVisibleCount = () => {
      const mapConfig = getMapConfigSync();
      const visibleCount = mapConfig.layers.filter((l: any) => l.visible !== false).length;
      setVisibleLayerCount(visibleCount);
    };

    updateVisibleCount();

    window.addEventListener('layerVisibilityChanged', updateVisibleCount);

    return () => {
      window.removeEventListener('layerVisibilityChanged', updateVisibleCount);
    };
  }, [loaderData.layers]);

  const closeExplorer = useCallback(() => {
    setLayerExplorerVisible(false);
    setLayerExplorerResult(null);
  }, [setLayerExplorerVisible, setLayerExplorerResult]);

  const submitAddLayer = useCallback(
    (layerUrl: string) => {
      const normalized = layerUrl.trim();
      if (!normalized) {
        return;
      }
      closeExplorer();
      setLayerAlert("", undefined);
      setLoadingMessage(`Loading layer ${normalized}`);
      const data = new FormData();
      data.set("layer-url", normalized);
      data.set("intent", "add-layer");
      fetcher.submit(data, { method: "post" });
    },
    [closeExplorer, fetcher, setLayerAlert, setLoadingMessage]
  );

  const handleExplorerClose = useCallback(() => {
    closeExplorer();
  }, [closeExplorer]);

  const handleExplorerAdd = useCallback(
    (layer: ArcGISFeatureLayerNode, _service: ArcGISServiceNode) => {
      submitAddLayer(layer.url);
    },
    [submitAddLayer]
  );

  const closeWfsExplorer = useCallback(() => {
    setWfsExplorerVisible(false);
    setWfsCapabilities(null);
  }, []);

  const handleExplorerAddWfs = useCallback(
    (featureType: WfsFeatureType, baseUrl: string, version: string) => {
      closeWfsExplorer();
      setLayerAlert("", undefined);
      setLoadingMessage(`Adding WFS layer ${featureType.title || featureType.name}`);
      const data = new FormData();
      data.set("wfs-url", baseUrl);
      data.set("wfs-type-name", featureType.name);
      data.set("wfs-version", version);
      data.set("wfs-title", featureType.title || featureType.name);
      data.set("intent", "add-wfs-layer");
      fetcher.submit(data, { method: "post" });
    },
    [closeWfsExplorer, fetcher, setLayerAlert, setLoadingMessage]
  );

  const handleLayerSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      const rawUrl = (formData.get("layer-url") as string | null)?.trim() ?? "";
      if (!rawUrl) {
        setLayerAlert("Please enter a URL.", "warning");
        return;
      }

      closeExplorer();
      closeWfsExplorer();
      setLayerAlert("", undefined);
      setAnalyzingUrl(true);

      // Check for WFS before ArcGIS analysis
      if (isWfsUrl(rawUrl)) {
        const baseUrl = normalizeWfsBaseUrl(rawUrl);
        setLayerUrlInput(baseUrl);
        setLoadingMessage(`Fetching WFS capabilities from ${baseUrl}`);
        try {
          const capabilities = await fetchWfsCapabilities(baseUrl);
          setAnalyzingUrl(false);
          setWfsBaseUrl(baseUrl);
          setWfsCapabilities(capabilities);
          setWfsExplorerVisible(true);
        } catch (err) {
          setAnalyzingUrl(false);
          setLayerAlert((err as Error).message, "error");
        }
        return;
      }

      // ArcGIS path
      const cleanedUrl = cleanArcGISUrl(rawUrl);
      setLayerUrlInput(cleanedUrl);
      setLoadingMessage(`Analyzing ${cleanedUrl}`);

      try {
        const analysis = await analyzeArcGISEndpoint(cleanedUrl);
        const normalized = analysis.normalizedUrl;

        if (analysis.endpointType === "feature-layer") {
          setAnalyzingUrl(false);
          submitAddLayer(normalized);
          return;
        }

        const traversal = await traverseFeatureLayers(normalized, analysis);
        setAnalyzingUrl(false);

        if (traversal.featureLayers.length === 0) {
          setLayerAlert("No feature layers found at this endpoint.", "warning");
          return;
        }

        setLayerExplorerResult(traversal);
        setLayerExplorerVisible(true);
      } catch (err) {
        const error = err as Error;
        setAnalyzingUrl(false);
        setLayerAlert(error.message, "error");
      }
    },
    [closeExplorer, closeWfsExplorer, setLayerAlert, setLayerUrlInput, setAnalyzingUrl, setLoadingMessage, setLayerExplorerResult, setLayerExplorerVisible, submitAddLayer]
  );

  // Show/hide modal based on fetcher or analysis state
  useEffect(() => {
    if (analyzingUrl || fetcher.state === "submitting" || fetcher.state === "loading") {
      setShowLoadingModal(true);
    } else {
      setShowLoadingModal(false);
    }
  }, [analyzingUrl, fetcher.state]);

  useEffect(() => {
    if (!analyzingUrl && fetcher.state === "idle") {
      setLoadingMessage("");
    }
  }, [analyzingUrl, fetcher.state]);

  useEffect(() => {
    const err = (fetcher.data as { err?: string } | undefined)?.err;
    if (err) {
      setLayerAlert(err, "error");
    }
  }, [fetcher.data, setLayerAlert]);

  useEffect(() => {
    const f = async () => {
      const promises: Promise<QueryResult>[] = []
      for (const layer of loaderData.layers) {
        // WFS layers are downloaded directly — skip ArcGIS queryLayer for them
        if (isArcGisLayer(layer as EsriLayerWithConfig)) {
          promises.push(queryLayer(layer))
        }
      }
      const results = await Promise.all(promises)
      setResults(results)
    }
    f()
  }, [loaderData, filterExtent])

  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [isLayersPanelCollapsed, setIsLayersPanelCollapsed] = useState(false)
  const [visibleLayerCount, setVisibleLayerCount] = useState(0)

  return (
    <MapViewProvider>
      <div style={{ height: 'calc(100vh - 64px)' }} className="flex flex-col p-2">
        <div className="flex flex-row flex-1 overflow-hidden gap-2">
          {/* Left Panel - Layers */}
          <div
            style={{ width: isLayersPanelCollapsed ? '48px' : `${leftPanelWidth}px` }}
            className="h-full overflow-hidden p-4 flex-none bg-white dark:bg-dark-bg transition-all duration-300 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4 flex-none">
              {!isLayersPanelCollapsed && (
                <>
                  <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">Layers</h5>

                  <button
                    onClick={() => setShowRemoveModal(srm => !srm)}
                    className="inline-flex items-center p-2 text-sm font-medium rounded-lg text-primary-700 hover:bg-gray-100 dark:text-primary-500 dark:hover:bg-gray-700">
                    Remove All
                  </button>
                </>
              )}
              <button
                onClick={() => setIsLayersPanelCollapsed(!isLayersPanelCollapsed)}
                className="inline-flex items-center p-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                title={isLayersPanelCollapsed ? "Expand layers panel" : "Collapse layers panel"}
              >
                {isLayersPanelCollapsed ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                )}
              </button>
              <RemoveLayerModal
                url=""
                show={showRemoveModal}
                setShow={setShowRemoveModal}
              />
            </div>

            {/* Broken layers are handled via modal now */}

            {!isLayersPanelCollapsed && (
              <>
                <div className="flow-root flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                  <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                    {loaderData.layers.length > 0 ? loaderData.layers.map((layer) =>
                      <LayerDropdownMenu
                        key={layer?.config?.url}
                        layer={layer}
                        boundary={filterExtent}
                      />
                    )
                      :
                      <li className="h-full flex flex-col items-center justify-items-center">
                        <p className="text-gray-400">
                          Add some layers :)
                        </p>
                      </li>
                    }
                  </ul>
                </div>
                {loaderData.layers.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 text-center flex-none">
                    Only checked layers are downloaded
                  </div>
                )}
              </>
            )}
          </div>

          {/* Resize handle for left panel */}
          {!isLayersPanelCollapsed && (
            <div
              className="w-px cursor-col-resize bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizingLeft(true);
              }}
            />
          )}

          {/* Main content area */}
          <div className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-dark-bg">
            {/* Top bar with search form */}
            <div className="flex-none p-2">
              <fetcher.Form method="post" onSubmit={handleLayerSubmit}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                  <input
                    type="search"
                    name="layer-url"
                    id="default-search"
                    className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-text-bg dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Add Layer Url Here (Like: https://gismaps.kingcounty.gov/arcgis/rest/services/Environment/KingCo_SensitiveAreas/MapServer/11)"
                    value={layerUrlInput}
                    onChange={(event) => setLayerUrlInput(event.currentTarget.value)}
                    autoComplete="off"
                    required
                  />
                  <button type="submit" name="intent" value="add-layer" className="text-white text-sm absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    Add
                  </button>
                </div>
                <Modal show={showLoadingModal} onClose={() => setShowLoadingModal(false)} size="md" popup dismissible>
                  <Modal.Header />
                  <Modal.Body>
                    <div className="text-center">
                      <HiOutlineArrowCircleDown className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                      <h3 className="mb-5 text-lg font-normal text-black dark:text-white truncate max-w-[400px]">
                        {loadingMessage
                          ? loadingMessage
                          : fetcher.formData?.get("layer-url")
                            ? `Loading layer ${fetcher.formData?.get("layer-url") as string}`
                            : "Loading layer..."}
                      </h3>
                    </div>
                  </Modal.Body>
                </Modal>
              </fetcher.Form>
              {(analyzingUrl || layerAlert.alertType) && (
                <div className="mt-2">
                  <StatusAlert loading={analyzingUrl} {...layerAlert} />
                </div>
              )}
              {layerExplorerResult && (
                <FeatureLayerExplorerModal
                  visible={layerExplorerVisible}
                  traversal={layerExplorerResult}
                  onClose={handleExplorerClose}
                  onAddLayer={handleExplorerAdd}
                />
              )}
            </div>
            {/* Map area - takes remaining space */}
            <div style={{ flex: '1 1 0', minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Outlet />
            </div>
          </div>

          {/* Resize handle for right panel */}
          <div
            className="w-px cursor-col-resize bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsResizingRight(true);
            }}
          />

          {/* Right Panel - Download Settings */}
          <div
            style={{ width: `${rightPanelWidth}px` }}
            className="overflow-y-auto p-4 flex-none bg-white dark:bg-dark-bg"
          >
            <Form className="space-y-6" method="post">
              <div>
                <label htmlFor="format" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Format</label>
                <select id="format" name="format" value={format} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-dark-text-bg dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  onChange={e => setFormat(e.currentTarget.value)}
                >
                  {Object.keys(Drivers).map(format =>
                    <option key={format} value={format}>{format}</option>
                  )}
                </select>
              </div>

              {format === "PMTiles" && (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="min-zoom" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Min Zoom ({minZoom})
                    </label>
                    <input
                      id="min-zoom"
                      type="range"
                      min="0"
                      max="22"
                      step="1"
                      value={minZoom}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      onChange={e => {
                        const val = parseInt(e.currentTarget.value);
                        setMinZoom(val);
                        if (val > maxZoom) setMaxZoom(val);
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor="max-zoom" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Max Zoom ({maxZoom})
                    </label>
                    <input
                      id="max-zoom"
                      type="range"
                      min="0"
                      max="22"
                      step="1"
                      value={maxZoom}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      onChange={e => {
                        const val = parseInt(e.currentTarget.value);
                        setMaxZoom(val);
                        if (val < minZoom) setMinZoom(val);
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="steps-range" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Concurrent Requests ({concurrent})</label>
                <input
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  id="steps-range"
                  type="range"
                  min="1"
                  max="9"
                  step="1"
                  value={concurrent}
                  onChange={e => setConcurrent(parseInt(e.currentTarget.value))}
                />
              </div>
              {/*<button className="w-full ml-2 text-white bg-orange-700 hover:bg-orange-800 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-800"
            >
              Schedule
            </button>*/}
              <button
                type="button"
                className="w-full ml-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loaderData.layers.length === 0 || visibleLayerCount === 0}
                title={
                  loaderData.layers.length === 0
                    ? "Add at least one layer to enable download"
                    : visibleLayerCount === 0
                      ? "Select at least one layer to enable download"
                      : "Download layers"
                }
                onClick={(e) => {
                  // Prevent any parent <Form> submission in production environments/browsers
                  e.preventDefault();
                  e.stopPropagation();

                  const mapConfig = getMapConfigSync();
                  const visibleLayerUrls = new Set(
                    mapConfig.layers
                      .filter((l: any) => l.visible !== false)
                      .map((l: any) => l.url)
                  );
                  const boundary = mapConfig.map?.boundary || "";

                  // Prepare layer configurations for the download page, filtering by current visibility
                  const layerConfigs = loaderData.layers
                    .filter(layer => visibleLayerUrls.has(layer.config?.url || layer.esri.url))
                    .map(layer => ({
                      url: layer.config?.url || layer.esri.url,
                      where: layer.config?.where_clause || "1=1",
                      columnMapping: layer.config?.column_mapping as Record<string, string> | undefined,
                      service_type: layer.config?.service_type,
                      wfs_type_name: layer.config?.wfs_type_name,
                      wfs_version: layer.config?.wfs_version,
                      wfs_title: layer.config?.wfs_title || layer.esri.title || layer.config?.name,
                    }));

                  // Create URL with parameters
                  const params = new URLSearchParams({
                    format: String(format),
                    concurrent: String(concurrent),
                    layers: JSON.stringify(layerConfigs),
                  });

                  if (format === "PMTiles") {
                    params.set("minZoom", String(minZoom));
                    params.set("maxZoom", String(maxZoom));
                  }

                  // Add boundary if it exists
                  if (boundary) {
                    params.set('boundary', boundary);
                  }

                  const href = `/download?${params.toString()}`;
                  // Safari-safe: open a blank tab first, then navigate and sever opener.
                  // This avoids WebKit occasionally using same-tab for window.open(url, '_blank', 'noopener').
                  const newWin = window.open('', '_blank');
                  if (newWin) {
                    try { newWin.opener = null; } catch { }
                    newWin.location.href = href;
                  } else {
                    // Popup blocked: fall back to same-tab navigation
                    window.location.href = href;
                  }
                }}
              >
                Download
              </button>
            </Form>
          </div>
        </div>

        {/* WFS feature type explorer modal */}
        {wfsExplorerVisible && wfsCapabilities && (
          <WfsFeatureExplorerModal
            capabilities={wfsCapabilities}
            baseUrl={wfsBaseUrl}
            onAdd={handleExplorerAddWfs}
            onClose={closeWfsExplorer}
          />
        )}

        {/* Modal explaining broken layers with a single "Remove all" action */}
        {broken?.length > 0 && (
          <Modal show={showBrokenModal} size="xl" popup onClose={() => {/* block closing to avoid invalid state */ }}>
            <Modal.Header>Some layers couldn’t be loaded</Modal.Header>
            <Modal.Body>
              <div className="space-y-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  One or more saved layers failed to load. They may have been removed, moved, or require authentication now.
                  To keep your map stable, remove these broken layers.
                </p>
                <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md">
                  <Table hoverable>
                    <Table.Head>
                      <Table.HeadCell>Name</Table.HeadCell>
                      <Table.HeadCell>URL</Table.HeadCell>
                      <Table.HeadCell>Reason</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                      {broken.map((b) => (
                        <Table.Row key={b.url} className="bg-white dark:bg-dark-text-bg">
                          <Table.Cell className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                            {b.name ?? "—"}
                          </Table.Cell>
                          <Table.Cell className="text-xs text-gray-600 dark:text-gray-300 break-all max-w-[360px]">
                            {b.url}
                          </Table.Cell>
                          <Table.Cell className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[260px]" title={b.reason}>
                            {b.reason}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
                <div className="flex justify-end gap-2">
                  <Button color="gray" onClick={handleRetryBrokenCheck} disabled={retryingBrokenCheck}>
                    {retryingBrokenCheck ? "Retrying…" : "Retry check"}
                  </Button>
                  <Button color="failure" onClick={() => {
                    const brokenUrls = new Set(broken.map(b => b.url))
                    const next = { ...loaderData.mapConfig, layers: loaderData.mapConfig.layers.filter(l => !brokenUrls.has(l.url)) }
                    saveMapConfigLocal(next)
                    window.location.reload()
                  }} disabled={retryingBrokenCheck}>
                    Remove all broken layers
                  </Button>
                </div>
              </div>
            </Modal.Body>
          </Modal>
        )}
      </div>
    </MapViewProvider>
  );
}

type LayerDropdownMenuProps = {
  layer: any
  boundary?: Geometry
}

function LayerDropdownMenu({ layer, boundary }: LayerDropdownMenuProps) {
  const wfs = isWfsLayer(layer);
  const { url } = layer.esri;
  const sourceJSON = wfs ? null : (layer.esri as any).sourceJSON;
  const realUrl = wfs ? layer.config?.url ?? url : getRealUrl(layer.esri);
  const displayName = wfs
    ? layer.config?.wfs_title || layer.config?.name || layer.config?.wfs_type_name || url
    : sourceJSON?.["name"] ?? url;
  const displayDescription = wfs ? "" : (sourceJSON?.["description"] ?? "");

  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [showConfigureModal, setShowConfigureModal] = useState(false)
  const mapView = useMapView()
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const containerRef = useRef<HTMLLIElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [isVisible, setIsVisible] = useState(layer.config?.visible !== false);

  // Manage layer visibility on the map
  useEffect(() => {
    if (!mapView || !mapView.map) {
      return;
    }

    const setupLayer = async () => {
      if (isVisible) {
        // Ensure layer is loaded before setting popup template
        await layer.esri.load();

        // Set popup template if not already set
        if (!layer.esri.popupTemplate) {
          try {
            layer.esri.popupTemplate = (layer.esri as any).createPopupTemplate();
          } catch {
            // createPopupTemplate not available; popup will still work if popupTemplate is set manually
          }
        }
        layer.esri.popupEnabled = true;

        // Add layer to map if not already present
        if (!mapView.map?.layers.includes(layer.esri)) {
          mapView.map?.add(layer.esri);
        }
      } else {
        // Remove layer from map if present
        if (mapView.map?.layers.includes(layer.esri)) {
          mapView.map?.remove(layer.esri);
        }
      }
    };

    setupLayer().catch(err => console.error("Error setting up layer:", err));

    // Cleanup: remove layer when component unmounts
    return () => {
      if (mapView.map && mapView.map.layers.includes(layer.esri)) {
        mapView.map.remove(layer.esri);
      }
    };
  }, [isVisible, mapView, layer.esri, wfs]);

  function closeDropdown() {
    if (isDropDownOpen) {
      triggerRef.current?.click()
      setIsDropDownOpen(false)
    }
  }
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent | TouchEvent) {
      // Only attempt to close if currently open; prevents opening on outside clicks
      if (!isDropDownOpen) return;
      const target = e.target as Node | null;
      if (!containerRef.current || !target) return;
      // if clicked inside the component, do nothing
      if (containerRef.current.contains(target)) return;
      // otherwise, close the dropdown
      closeDropdown()
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isDropDownOpen])

  const handleZoomToLayer = useCallback(() => {
    if (!mapView) {
      console.warn("MapView not available");
      return;
    }

    // For WFS layers use fullExtent; for ArcGIS layers use sourceJSON extent
    const goToTarget = wfs
      ? layer.esri.fullExtent
      : (() => {
          const extentData = sourceJSON?.extent;
          if (!extentData) {
            console.warn(`Layer "${displayName}" has no extent in sourceJSON`);
            return null;
          }
          return new Extent({
            xmin: extentData.xmin,
            ymin: extentData.ymin,
            xmax: extentData.xmax,
            ymax: extentData.ymax,
            spatialReference: extentData.spatialReference
          });
        })();

    if (!goToTarget) return;

    mapView.when(() => {
      mapView.goTo(goToTarget, { animate: true, duration: 1000 }).catch((err) => {
        console.error(`Error zooming to layer "${displayName}":`, err);
      });
    }).catch((err) => {
      console.error("MapView not ready:", err);
    });
  }, [mapView, sourceJSON, displayName, wfs, layer.esri]);

  return <li ref={containerRef} key={url} className="flex flex-row items-center p-2 bg-white dark:bg-dark-bg">
    <Checkbox
      checked={isVisible}
      onChange={(e) => {
        const newVisibility = e.target.checked;
        setIsVisible(newVisibility);

        const mapConfig = getMapConfigSync();
        const layerIndex = mapConfig.layers.findIndex((l: any) => l.url === layer.config?.url);
        if (layerIndex !== -1) {
          mapConfig.layers[layerIndex].visible = newVisibility;
          saveMapConfigLocal(mapConfig);
          window.dispatchEvent(new Event('layerVisibilityChanged'));
        }
      }}
      className="mr-2"
    />
    <div className="flex-1 min-w-0 max-w-xs">
      <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
        <Link to={realUrl} target="_blank">
          {displayName}
        </Link>
      </p>
      {displayDescription && (
        <p className="text-sm text-gray-500 truncate dark:text-gray-400">
          {displayDescription}
        </p>
      )}
    </div>
    <Dropdown
      className="dark:text-white dark:bg-dark-bg"
      inline
      dismissOnClick={true}
      arrowIcon={false}
      label={
        <button
          ref={triggerRef}
          onClick={() => setIsDropDownOpen(prev => !prev)}
          className="hover:bg-gray-100 dark:bg-dark-bg dark:hover:bg-gray-700 p-2 rounded-lg"
        >
          <svg className="w-4 h-4 text-gray-800 dark:text-white " aria-hidden="true" fill="currentColor" viewBox="0 0 4 15">
            <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
          </svg>
        </button>
      }
    >
      <Dropdown.Item
        icon={() =>
          <svg className="w-5 h-5 pr-2 text-gray-800 dark:text-white" aria-hidden fill="currentColor" viewBox="0 0 20 14">
            <path d="M18 0H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM2 6h7v6H2V6Zm9 6V6h7v6h-7Z" />
          </svg>}
        onClick={() => {
          closeDropdown()
          setShowConfigureModal(true);
        }}
      >
        {wfs ? "Columns..." : "Filters & Attributes..."}
      </Dropdown.Item>
      <Dropdown.Item
        icon={() =>
          <svg className="w-5 h-5 pr-2 text-gray-800 dark:text-white" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>}
        onClick={() => {
          closeDropdown()
          handleZoomToLayer()
        }}
      >
        Zoom to Layer
      </Dropdown.Item>
      <Dropdown.Item
        icon={() =>
          <svg className="w-5 h-5 pr-2 text-gray-800 dark:text-white" aria-hidden="true" fill="none" viewBox="0 0 18 18">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778" />
          </svg>
        }
        onClick={() => {
          closeDropdown()
          window.open(realUrl, "_blank");
        }}
      >
        <Link to={realUrl} target="_blank">
          View
        </Link>
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item
        className="text-red-500 dark:text-red-500 hover:text-red-500 hover:dark:text-red-500"
        icon={() =>
          <svg className="w-5 h-5 pr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 18 20">
            <path d="M17 4h-4V2a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2H1a1 1 0 0 0 0 2h1v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1a1 1 0 1 0 0-2ZM7 2h4v2H7V2Zm1 14a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0v8Zm4 0a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0v8Z" />
          </svg>
        }
        onClick={() => {
          closeDropdown()
          setShowRemoveModal(true);
        }}
      >
        Remove
      </Dropdown.Item>
    </Dropdown>
    <RemoveLayerModal
      show={showRemoveModal}
      setShow={setShowRemoveModal}
      url={realUrl}
    />
    <ModifyLayerConfig
      show={showConfigureModal}
      setShow={setShowConfigureModal}
      layer={layer}
      boundary={boundary}
    />
  </li>
}

type RemoveLayerModalProps = {
  url: string
  show: boolean
  setShow: React.Dispatch<React.SetStateAction<boolean>>
}

function RemoveLayerModal({ url, show, setShow }: RemoveLayerModalProps) {

  const fetcher = useFetcher()

  useEffect(() => {
    if (fetcher.data === "removed") {
      setShow(false)
    }
  }, [fetcher.data])

  return (
    <Modal show={show} size="md" onClose={() => setShow(false)} popup dismissible>
      <Modal.Header />
      <Modal.Body>
        <fetcher.Form action="/maps/create/remove-layer" method="post">
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              {url ?
                "Are you sure you want to remove layer?"
                : "Are you sure you want to remove all layers?"}
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" type="submit" name="url" value={url}>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setShow(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </fetcher.Form>
      </Modal.Body>
    </Modal>
  )
}


type ModifyLayerConfigProps = {
  layer: any
  show: boolean
  boundary?: Geometry
  setShow: React.Dispatch<React.SetStateAction<boolean>>
}

function ModifyLayerConfig({ show, setShow, boundary, layer }: ModifyLayerConfigProps) {
  const isWfs = layer.config?.service_type === "wfs"
  const fields = (layer.esri.fields ?? []) as Array<{ name: string; alias?: string }>
  const [results, setResults] = useState<FeatureSet>()
  const fetcher = useFetcher()
  const [where, setWhere] = useState(layer?.config?.where_clause ?? "1=1")

  const cancelButtonRef = useRef(null)

  const onUpdateClick = async (where: string) => {
    setWhere(where)
    setResults(await (layer.esri as EsriLayerWithConfig["esri"]).queryFeatures({
      where: where,
      geometry: boundary,
      num: 20,
      outFields: ["*"],
      returnGeometry: true,
    }))
  }

  useEffect(() => {
    if (!isWfs) {
      onUpdateClick(where)
    }
  }, [])

  useEffect(() => {
    if (fetcher.data) {
      setShow(false)
    }
  }, [fetcher])

  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setShow}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel>
                <div className="bg-white dark:bg-dark-bg dark:text-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                        Configure Layer {layer?.config?.name}
                      </Dialog.Title>
                    </div>
                  </div>
                  <fetcher.Form action="/maps/create/layers/configure" method="post">
                    <div className="flex flex-col gap-2">
                      <input name="url" value={layer?.config?.url} className="hidden" readOnly />
                      {!isWfs && (
                        <WhereInput defaultWhere={layer?.config?.where_clause ?? "1=1"} onUpdateClick={onUpdateClick} />
                      )}
                      <div>
                        <label className="block mb-2 text-sm font-medium leading-6 text-gray-900 dark:text-white">Select and Rename Columns</label>
                        <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                          <Table striped hoverable>
                            <Table.Head>
                              <Table.HeadCell className="w-12">
                                Include
                              </Table.HeadCell>
                              <Table.HeadCell className="w-1/3">
                                Original Name
                              </Table.HeadCell>
                              <Table.HeadCell className="w-1/3">
                                New Name
                              </Table.HeadCell>
                              {!isWfs && (
                                <Table.HeadCell>
                                  Sample Value
                                </Table.HeadCell>
                              )}
                            </Table.Head>
                            <Table.Body className="divide-y">
                              {fields.map(field => {
                                const isSelected = layer?.config?.column_mapping ? (field.name in (layer.config.column_mapping as Record<string, string>)) : true;
                                const newName = layer?.config?.column_mapping ? (layer.config.column_mapping as Record<string, string>)[field.name] ?? field.name : field.name;
                                const sampleValue = results?.features?.[0]?.getAttribute(field.name);
                                return (
                                  <Table.Row key={field.name} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                    <Table.Cell>
                                      <Checkbox
                                        defaultChecked={isSelected}
                                        name={`${field.name}-enabled`}
                                      />
                                    </Table.Cell>
                                    <Table.Cell className="font-medium text-gray-900 dark:text-white">
                                      {field.name}
                                    </Table.Cell>
                                    <Table.Cell>
                                      <TextInput
                                        sizing="sm"
                                        id={field.name}
                                        name={`${field.name}-new`}
                                        defaultValue={newName}
                                        placeholder={field.name}
                                      />
                                    </Table.Cell>
                                    {!isWfs && (
                                      <Table.Cell className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                        {sampleValue !== null && sampleValue !== undefined ? String(sampleValue) : '—'}
                                      </Table.Cell>
                                    )}
                                  </Table.Row>
                                );
                              })}
                            </Table.Body>
                          </Table>
                        </div>
                      </div>
                      <div className="flex flex-row justify-end">
                        <Button type="submit"
                          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                          name="intent"
                          value="save-layer"
                        >Save
                        </Button>
                      </div>
                    </div>
                  </fetcher.Form>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

type WhereInputProps = {
  onUpdateClick: (_: string) => void
  defaultWhere?: string
}
function WhereInput({ defaultWhere, onUpdateClick }: WhereInputProps) {
  const [where, setWhere] = useState(defaultWhere ? defaultWhere : "1=1")
  return (
    <div>
      <label htmlFor="where" className="block mb-2 text-sm font-medium leading-6 text-gray-900 dark:text-white">Where Clause</label>
      <div className="flex flex-row">
        <input type="search" name="where" id="where" className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-text-bg dark:border-slate-600 dark:placeholder-slate-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500" required
          value={where}
          onChange={(e) => {
            e.preventDefault()
            setWhere(e.currentTarget.value)
          }}
        />
        <div className="inset-y-0 right-0 flex items-center">
          <button type="button" name="intent" value="modify-where"
            className="rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
            onClick={() => onUpdateClick(where)}
          >
            Refresh
          </button>
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-300 place-self-start">Use original column names in query</p>
    </div>
  )
}

const INDENT_PX = 20;

type FeatureLayerExplorerModalProps = {
  visible: boolean;
  traversal: ArcGISTraversalResult;
  onClose: () => void;
  onAddLayer: (layer: ArcGISFeatureLayerNode, service: ArcGISServiceNode) => void;
};

function FeatureLayerExplorerModal({ visible, traversal, onClose, onAddLayer }: FeatureLayerExplorerModalProps) {
  return (
    <Modal show={visible} onClose={onClose} size="5xl" popup>
      <Modal.Header>Select Feature Layer</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Source: <span className="break-all font-mono text-xs">{traversal.analyzedUrl}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Choose a feature layer below to add it to the map.
          </p>
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <FolderNodeView node={traversal.root} depth={0} onAddLayer={onAddLayer} />
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

type FolderNodeViewProps = {
  node: ArcGISFolderNode;
  depth: number;
  onAddLayer: (layer: ArcGISFeatureLayerNode, service: ArcGISServiceNode) => void;
};

function FolderNodeView({ node, depth, onAddLayer }: FolderNodeViewProps) {
  const currentIndent = depth * INDENT_PX;
  const childDepth = node.isVirtualRoot ? depth : depth + 1;

  return (
    <div className="space-y-4">
      {!node.isVirtualRoot && (
        <div
          className="text-sm font-semibold text-gray-800 dark:text-gray-100"
          style={{ marginLeft: currentIndent }}
        >
          {node.displayName}
        </div>
      )}

      {node.services.map((service) => (
        <ServiceNodeView
          key={`${service.fullName}:${service.type}`}
          service={service}
          depth={childDepth}
          onAddLayer={onAddLayer}
        />
      ))}

      {node.folders.map((child) => (
        <FolderNodeView
          key={child.pathFromServicesRoot.join("/") || child.displayName}
          node={child}
          depth={childDepth}
          onAddLayer={onAddLayer}
        />
      ))}
    </div>
  );
}

type ServiceNodeViewProps = {
  service: ArcGISServiceNode;
  depth: number;
  onAddLayer: (layer: ArcGISFeatureLayerNode, service: ArcGISServiceNode) => void;
};

function ServiceNodeView({ service, depth, onAddLayer }: ServiceNodeViewProps) {
  if (!service.layers.length) {
    return null;
  }

  const indent = depth * INDENT_PX;
  const label = `${service.name} (${service.type})`;

  return (
    <div className="space-y-3" style={{ marginLeft: indent }}>
      <div className="text-sm font-medium text-blue-700 dark:text-blue-400">{label}</div>
      {service.layers.map((layer) => (
        <LayerRow
          key={`${service.url}:${layer.id}`}
          layer={layer}
          service={service}
          depth={depth + 1}
          onAddLayer={onAddLayer}
        />
      ))}
    </div>
  );
}

type LayerRowProps = {
  layer: ArcGISFeatureLayerNode;
  service: ArcGISServiceNode;
  depth: number;
  onAddLayer: (layer: ArcGISFeatureLayerNode, service: ArcGISServiceNode) => void;
};

function LayerRow({ layer, service, depth, onAddLayer }: LayerRowProps) {
  const indent = depth * INDENT_PX;

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm hover:border-blue-200 hover:bg-blue-50 dark:border-gray-700 dark:bg-dark-text-bg dark:hover:border-blue-400"
      style={{ marginLeft: indent }}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{layer.name}</div>
        {layer.geometryType && (
          <div className="truncate text-xs text-gray-500 dark:text-gray-400">{layer.geometryType}</div>
        )}
      </div>
      <button
        type="button"
        className="whitespace-nowrap rounded-md border border-blue-600 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-500 dark:hover:text-white"
        onClick={() => onAddLayer(layer, service)}
      >
        Add to Map
      </button>
    </div>
  );
}

type WfsFeatureExplorerModalProps = {
  capabilities: WfsCapabilities;
  baseUrl: string;
  onAdd: (featureType: WfsFeatureType, baseUrl: string, version: string) => void;
  onClose: () => void;
};

function WfsFeatureExplorerModal({ capabilities, baseUrl, onAdd, onClose }: WfsFeatureExplorerModalProps) {
  return (
    <Modal show onClose={onClose} size="3xl" popup>
      <Modal.Header>Select WFS Feature Type</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Source: <span className="break-all font-mono text-xs">{baseUrl}</span>
          </p>
          {capabilities.serviceTitle && (
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{capabilities.serviceTitle}</p>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-300">
            WFS version: <span className="font-mono text-xs">{capabilities.version}</span>
          </p>
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-2">
            {capabilities.featureTypes.map((ft) => (
              <div
                key={ft.name}
                className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-800"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                    {ft.title || ft.name}
                  </div>
                  {ft.title && ft.title !== ft.name && (
                    <div className="truncate text-xs text-gray-500 dark:text-gray-400 font-mono">{ft.name}</div>
                  )}
                  {ft.abstract && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{ft.abstract}</div>
                  )}
                </div>
                <button
                  type="button"
                  className="whitespace-nowrap rounded-md border border-blue-600 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-500 dark:hover:text-white"
                  onClick={() => onAdd(ft, baseUrl, capabilities.version)}
                >
                  Add to Map
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
