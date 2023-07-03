import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { getQueryParameter } from "../../../url";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import React, { useEffect, useMemo, useState } from "react";
import { getRealUrl, QueryResults } from "../../../arcgis";
import Geometry from "@arcgis/core/geometry/Geometry";
import { ExtentPicker } from "../../../ExtentPicker";
import { ActionFunctionArgs, Form, Link, Outlet, useActionData, useLoaderData, useNavigate } from "react-router-dom";
import { Dropdown } from "flowbite-react";
import { Drivers } from "../../../downloader";
import ConfigureLayerModal from "../../../ConfigureLayerModal";
import { getMapConfigLocal, saveMapConfigLocal } from "../../../database";

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
  const mapConfig = getMapConfigLocal()

  let errMsg = ""
  if (formData.get("intent") === "add-layer") {
    const layerUrl = formData.get("layer-url") as string
    let layer: FeatureLayer | undefined = undefined
    if (!mapConfig.layers.find(l => l.url === layerUrl)) {
      try {
        layer = new FeatureLayer({
          url: layerUrl,
        });
        await layer.load();
        mapConfig.layers.push({
          url: layerUrl,
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

  return {
    layers: layers,
    mapConfig: mapConfig,
    err: errMsg,
  }
}

export const mapCreatorLoader = async () => {
  const mapConfig = getMapConfigLocal()
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
  try {
    await Promise.all(promises)
  } catch (e) {
    const err = e as Error;
    errMsg = err.message
  }
  console.log(mapConfig)
  return {
    layers: layers,
    err: errMsg,
  }
}

export default function MapCreator() {

  const queryParam = useMemo(() => getQueryParameter("format"), []);
  const [exportType, setExportType] = useState<SupportedExportType>(
    isSupportedExportType(queryParam) ? queryParam : "GPKG"
  );

  const actionData = useLoaderData() as Awaited<ReturnType<typeof mapCreatorLoader>>
  let layers: FeatureLayer[] = []
  if (actionData) {
    layers = actionData.layers
  }

  const [layer, setLayer] = useState<FeatureLayer | undefined>();
  const [filterExtent, setFilterExtent] = useState<Geometry | undefined>(
    undefined
  );
  const boundaryExtent = getQueryParameter("boundary") ?? "";

  useEffect(() => {
    if (layers.length > 0) {
      setLayer(layers[0])
    }
  }, [layers])



  return (
    <div className="h-full p-2 pt-3">
      <div className="flex flex-row gap-1 min-h-full">
        <div className="w-3/12 max-w-xs p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">Layers</h5>
          </div>
          <div className="flow-root">
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
              {layers.length > 0 ? layers.map((layer) =>
                <LayerDropdownMenu
                  key={layer.id}
                  layer={layer}
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
        </div>
        <div className="flex flex-col gap-2 w-full flex-grow p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
          <Form method="post">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input type="search" name="layer-url" id="default-search" className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Paste URL or Search" required />
              <button type="submit" name="intent" value="add-layer" className="text-white text-sm absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Submit
              </button>
            </div>
          </Form>
          <ExtentPicker
            defaultBoundaryExtent={boundaryExtent}
            layer={layer}
            onFilterGeometryChange={(g) => setFilterExtent(g)}
            where={"1=1"}
          />
        </div>
        <div className="w-2/12 max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
          <Form className="space-y-6" method="post">
            <h5 className="text-xl font-medium text-gray-900 dark:text-white">Export</h5>

            <label htmlFor="format" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Format</label>
            <select id="format" name="format" defaultValue={exportType} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
              {Object.keys(Drivers).map(format =>
                <option key={format} value={format}>{format}</option>
              )}
            </select>

            <label htmlFor="steps-range" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Concurrent Requests</label>
            <input id="steps-range" type="range" min="1" max="5" defaultValue="1" step="1" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
            <button type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              Download
            </button>
          </Form>
        </div>
      </div>

      <Outlet />
    </div>
  );
}

type LayerDropdownMenuProps = {
  layer: FeatureLayer
}

function LayerDropdownMenu({ layer }: LayerDropdownMenuProps) {
  const { url, sourceJSON } = layer
  const realUrl = getRealUrl(layer)
  const navigate = useNavigate()

  return <li key={url} className="flex flex-row items-center p-2 bg-white dark:bg-gray-800">
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
      className="dark:text-white"
      inline
      label=""
    >
      <Dropdown.Item
        icon={() =>
          <svg className="w-5 h-5 pr-2 text-gray-800 dark:text-white" aria-hidden fill="currentColor" viewBox="0 0 20 14">
            <path d="M18 0H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM2 6h7v6H2V6Zm9 6V6h7v6h-7Z" />
          </svg>}
      >
        Configure
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item
        className="text-red-500 dark:text-red-50"
        icon={() =>
          <svg className="w-5 h-5 pr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 18 20">
            <path d="M17 4h-4V2a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2H1a1 1 0 0 0 0 2h1v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1a1 1 0 1 0 0-2ZM7 2h4v2H7V2Zm1 14a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0v8Zm4 0a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0v8Z" />
          </svg>
        }
        onClick={() => navigate(`remove-layer?url=${url}`)}
      >
        Remove

      </Dropdown.Item>
    </Dropdown>
  </li>
}
