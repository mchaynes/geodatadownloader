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
import { Alert, Button, Checkbox, Dropdown, Modal, Progress, Table, TextInput } from "flowbite-react";
import { Drivers, GdalDownloader } from "../../../downloader";
import { StatusAlert, useStatusAlert } from "../../../StatusAlert";
import { getMapConfigLocal, saveMapConfigLocal } from "../../../database";

import { HiOutlineExclamationCircle, HiOutlineArrowCircleDown } from "react-icons/hi";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet";
import { EsriLayerWithConfig, raise } from "../../../types";
import {
  analyzeArcGISEndpoint,
  traverseFeatureLayers,
  ArcGISTraversalResult,
  ArcGISServiceNode,
  ArcGISFolderNode,
  ArcGISFeatureLayerNode,
} from "../../../traverse";
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
    const normalizeUrl = (u: string) => (u ?? "").trim().replace(/\/+$/, "")
    const normalizedInput = normalizeUrl(layerUrl)
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
    if (!mapConfig.layers.find(l => normalizeUrl(l.url) === normalizedInput)) {
      try {
        layer = new FeatureLayer({
          url: layerUrl,
        });
        await layer.load();
        // Ensure we persist the canonical layer URL (with layerId, no trailing slash)
        const realUrl = normalizeUrl(getRealUrl(layer))
        mapConfig.layers.push({
          url: realUrl,
          name: layer.sourceJSON["name"],
          description: layer.sourceJSON["description"],
          extent: layer.fullExtent,
          fields: JSON.stringify(layer.fields),
          geometry_type: layer.geometryType,
          spatial_ref: `${layer.spatialReference.wkid}`,
        })
        saveMapConfigLocal(mapConfig)
      } catch (e) {
        const err = e as Error;
        errMsg = err.message
      }
    }
  }
  // if (formData.get("intent") === "save-map") {
  //   await saveMap(mapConfig)
  // }
  const layers: Array<FeatureLayer> = []
  const promises: Promise<void>[] = []
  for (const savedLayers of mapConfig.layers) {
    const layer = new FeatureLayer({
      url: savedLayers.url
    })
    layers.push(layer)
    promises.push(layer.load())
  }
  try {
    await Promise.all(promises)
  } catch (e) {
    const err = e as Error;
    errMsg = err.message
  }
  const normalizeUrl = (u: string) => (u ?? "").replace(/\/+$/, "");
  const esriWithConfig = layers.map(esri => ({
    esri: esri,
    config: mapConfig.layers.find(l => normalizeUrl(l.url) === normalizeUrl(getRealUrl(esri))) 
  }))


  return {
    layers: esriWithConfig,
    mapConfig: mapConfig,
    err: errMsg,
  }
}

export const mapCreatorLoader = async () => {
  const mapConfig = await getMapConfigLocal()
  const layers: Array<FeatureLayer> = []
  let errMsg = ""
  const promises: Promise<void>[] = []
  for (const savedLayers of mapConfig.layers) {
    const layer = new FeatureLayer({
      url: savedLayers.url
    })
    layers.push(layer)
    promises.push(layer.load())
  }
  const results = await Promise.allSettled(promises)
  const brokenLayers: Array<{ url: string; name?: string; reason: string }> = []
  results.forEach((res, idx) => {
    if (res.status === "rejected") {
      const saved = mapConfig.layers[idx]
      const reason = (res.reason as Error)?.message ?? "Failed to load layer"
      brokenLayers.push({ url: saved.url, name: (saved as any)?.name, reason })
    }
  })
  if (brokenLayers.length && !errMsg) {
    errMsg = "One or more layers failed to load."
  }
  const normalizeUrl = (u: string) => (u ?? "").replace(/\/+$/, "");
  // Only include successfully loaded layers in UI
  const okLayers = layers.filter((_, idx) => results[idx]?.status === "fulfilled")
  const esriWithConfig = okLayers.map(esri => ({
    esri: esri,
    config: mapConfig.layers.find(l => normalizeUrl(l.url) === normalizeUrl(getRealUrl(esri)))
  }))
  return {
    mapConfig: mapConfig,
    layers: esriWithConfig,
    brokenLayers,
    err: errMsg,
  }
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

  const [filterExtent, setFilterExtent] = useState<Geometry | undefined>(
    undefined
  );
  const [format, setFormat] = useState<keyof typeof Drivers>("GPKG")
  const [concurrent, setConcurrent] = useState(1)

  const [results, setResults] = useState<QueryResult[]>([])
  const [featDld, setFeatDld] = useState(0)

  const [downloader] = useState(new GdalDownloader((num) => setFeatDld(num)))
  // StatusAlert is no longer used for errors here; show a compact inline alert
  // with a modal for details to match the Downloader UX.
  const [, setMapAlertProps] = useStatusAlert("", undefined);
  const [mapDetailsOpen, setMapDetailsOpen] = useState(false);
  const [mapCompactVisible, setMapCompactVisible] = useState(false);
  const [mapPrettyMsg, setMapPrettyMsg] = useState<string | undefined>(undefined);
  const [mapDetailsText, setMapDetailsText] = useState<string | undefined>(undefined);
  const [totalFeatures, setTotalFeatures] = useState(0)
  const [percent, setPercent] = useState(0)


  const [showLoadingModal, setShowLoadingModal] = useState(false)
  const fetcher = useFetcher()

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
      setLayerUrlInput(normalized);
      setLoadingMessage(`Loading layer ${normalized}`);
      const data = new FormData();
      data.set("layer-url", normalized);
      data.set("intent", "add-layer");
      fetcher.submit(data, { method: "post" });
    },
    [closeExplorer, fetcher, setLayerAlert, setLayerUrlInput, setLoadingMessage]
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

  const handleLayerSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      const rawUrl = (formData.get("layer-url") as string | null)?.trim() ?? "";
      if (!rawUrl) {
        setLayerAlert("Please enter an ArcGIS REST URL.", "warning");
        return;
      }

      closeExplorer();
      setLayerAlert("", undefined);
      setLayerUrlInput(rawUrl);
      setAnalyzingUrl(true);
      setLoadingMessage(`Analyzing ${rawUrl}`);

      try {
        const analysis = await analyzeArcGISEndpoint(rawUrl);
        const normalized = analysis.normalizedUrl;
        setLayerUrlInput(normalized);

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
    [closeExplorer, setLayerAlert, setLayerUrlInput, setAnalyzingUrl, setLoadingMessage, setLayerExplorerResult, setLayerExplorerVisible, submitAddLayer]
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
        promises.push(queryLayer(layer))
      }
      const results = await Promise.all(promises)
      setResults(results)
    }
    f()
  }, [loaderData, filterExtent])

  useEffect(() => {
    let newTotal = 0
    for (const r of results) {
      newTotal += r.totalCount
    }
    setTotalFeatures(newTotal)
  }, [results])

  useEffect(() => {
    setPercent(Math.floor((featDld / totalFeatures) * 100))
  }, [totalFeatures, featDld])


  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [isLayersPanelCollapsed, setIsLayersPanelCollapsed] = useState(false)

  const layersPanelClasses = [
    isLayersPanelCollapsed ? 'w-12' : 'w-3/12',
    'min-w-fit overflow-y-auto max-w-xs p-4',
    'bg-white border border-gray-200 rounded-lg shadow sm:p-8',
    'dark:bg-dark-bg dark:border-gray-700',
    'transition-all duration-300'
  ].join(' ')

  return (
    <MapViewProvider>
      <div className="p-2">
        <div className="flex flex-row gap-1">
          <div className={layersPanelClasses}>
          <div className="flex items-center justify-between mb-4">
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
            <div className="flow-root">
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
          )}
        </div>
        <div className="flex flex-col gap-2 w-full flex-grow p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-dark-bg dark:border-gray-700">
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
            <div className="mt-3">
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
          <Outlet />
        </div>
        <div className="w-2/12 max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 dark:bg-dark-bg dark:border-gray-700">
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
              className="w-full ml-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={async () => {
                try {
                  // clear previous alerts
                  setMapAlertProps("", undefined);
                  await downloader.download(results, concurrent, format as string);
                  setMapAlertProps("Download completed", "success");
                } catch (e) {
                  const err = e as Error;
                  console.error(err);
                  // Prepare pretty and technical messages and show compact alert
                  const msg = err.message ?? "An unknown error occurred while downloading.";
                  if (msg.includes("No output files were generated")) {
                    setMapPrettyMsg(
                      "No files were generated for this download. This may mean the ArcGIS server returned an error, or no features matched your query. Check the layer URL and try again."
                    );
                  } else if (msg.includes("ArcGIS server error")) {
                    const parts = msg.split(":");
                    const serverMsg = parts.slice(1).join(":").trim() || msg;
                    setMapPrettyMsg(`Server error when fetching layer: ${serverMsg}. Try again later or check the layer's service URL.`);
                  } else {
                    setMapPrettyMsg(msg);
                  }
                  setMapDetailsText(err.message);
                  // clear any long status alert and show compact inline alert
                  setMapAlertProps("", undefined);
                  setMapCompactVisible(true);
                }
              }}
            >
              Download
            </button>
            {mapCompactVisible && (
              <div style={{ marginTop: 12 }}>
                <Alert color="failure" onDismiss={() => setMapCompactVisible(false)}>
                  <div className="flex flex-col">
                    <span className="font-medium">Download failed.</span>
                    <button
                      type="button"
                      className="underline text-left mt-1"
                      style={{ padding: 0 }}
                      onClick={() => setMapDetailsOpen(true)}
                    >
                      See why
                    </button>
                  </div>
                </Alert>
              </div>
            )}
            <Modal show={mapDetailsOpen} onClose={() => setMapDetailsOpen(false)} size="xl" popup>
              <Modal.Header />
              <Modal.Body>
                <div className="text-left">
                  <h3 className="mb-4 text-lg font-medium">Download details</h3>
                  <div className="mb-4">
                    <p className="whitespace-normal break-words">{mapPrettyMsg}</p>
                  </div>
                  <div>
                    <strong>Technical details</strong>
                    <pre className="text-sm overflow-x-auto whitespace-pre" style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>{mapDetailsText}</pre>
                  </div>
                </div>
              </Modal.Body>
            </Modal>
            {percent === 100 &&
              <Alert color="success">
                <span>
                  <p>
                    <span className="font-medium">
                      Done 🙌
                    </span>
                  </p>
                </span>
              </Alert>}
            {percent < 100 && percent > 0 && <Progress progress={percent} />}
          </Form>
        </div>
      </div>
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
  const { url, sourceJSON } = layer.esri
  const realUrl = getRealUrl(layer.esri)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [showConfigureModal, setShowConfigureModal] = useState(false)
  const mapView = useMapView()
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const containerRef = useRef<HTMLLIElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

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
    
    // Use extent from sourceJSON (the layer's metadata from ArcGIS REST API)
    const extentData = sourceJSON?.extent;
    if (!extentData) {
      console.warn(`Layer "${sourceJSON["name"]}" has no extent in sourceJSON`);
      return;
    }
    
    console.log("Zooming to extent:", extentData);
    console.log("MapView spatial reference:", mapView.spatialReference);
    
    // Create an Extent object from the sourceJSON extent
    const extent = new Extent({
      xmin: extentData.xmin,
      ymin: extentData.ymin,
      xmax: extentData.xmax,
      ymax: extentData.ymax,
      spatialReference: extentData.spatialReference
    });
    
    console.log("Created extent object:", extent);
    
    mapView.when(() => {
      console.log("MapView is ready, calling goTo...");
      mapView.goTo(extent, {
        animate: true,
        duration: 1000
      }).then(() => {
        console.log("Successfully zoomed to layer extent");
      }).catch((err) => {
        console.error(`Error zooming to layer "${sourceJSON["name"]}" (${realUrl}):`, err);
      });
    }).catch((err) => {
      console.error("MapView not ready:", err);
    });
  }, [mapView, sourceJSON, realUrl]);

  return <li ref={containerRef} key={url} className="flex flex-row items-center p-2 bg-white dark:bg-dark-bg">
    <div className="flex-1 min-w-0 max-w-xs">
      <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
        <Link to={realUrl} target="_blank">
          {sourceJSON["name"]}
        </Link>
      </p>
      <p className="text-sm text-gray-500 truncate dark:text-gray-400">
        {sourceJSON["description"]}
      </p>
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
        Filters & Attributes...
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
  layer: EsriLayerWithConfig
  show: boolean
  boundary?: Geometry
  setShow: React.Dispatch<React.SetStateAction<boolean>>
}

function ModifyLayerConfig({ show, setShow, boundary, layer }: ModifyLayerConfigProps) {
  const fields = layer.esri.fields
  const [results, setResults] = useState<FeatureSet>()
  const fetcher = useFetcher()
  const [where, setWhere] = useState(layer?.config?.where_clause ?? "1=1")

  const cancelButtonRef = useRef(null)

  const onUpdateClick = async (where: string) => {
    setWhere(where)
    setResults(await layer.esri.queryFeatures({
      where: where,
      geometry: boundary,
      num: 20,
      outFields: ["*"],
      returnGeometry: true,
    }))
  }

  useEffect(() => {
    onUpdateClick(where)
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
                      <WhereInput defaultWhere={layer?.config?.where_clause ?? "1=1"} onUpdateClick={onUpdateClick} />
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
                              <Table.HeadCell>
                                Sample Value
                              </Table.HeadCell>
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
                                    <Table.Cell className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                      {sampleValue !== null && sampleValue !== undefined ? String(sampleValue) : '—'}
                                    </Table.Cell>
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
