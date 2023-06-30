import {
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { getQueryParameter } from "../../../url";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { useEffect, useMemo, useState } from "react";
import { QueryResults } from "../../../arcgis";
import Geometry from "@arcgis/core/geometry/Geometry";
import { ExtentPicker } from "../../../ExtentPicker";
import { ActionFunctionArgs, Form, Link, Outlet, useActionData } from "react-router-dom";
import { Formats } from "../../../types";
import AddLayerToMap from "./layers/add";
import { CustomFlowbiteTheme, Dropdown } from "flowbite-react";

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
  if (formData.get("intent") === "load-layer") {
    const layerUrl = formData.get("layer-url") as string
    let layer: FeatureLayer | undefined = undefined
    let errMsg = ""
    try {
      layer = new FeatureLayer({
        url: layerUrl,
      });
      await layer.load();
    } catch (e) {
      const err = e as Error;
      errMsg = err.message
    }
    return {
      layer: layer,
      err: errMsg,
    }
  }
  return null
}

export default function MapCreator() {
  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));

  const queryParam = useMemo(() => getQueryParameter("format"), []);
  const [exportType, setExportType] = useState<SupportedExportType>(
    isSupportedExportType(queryParam) ? queryParam : "gpkg"
  );

  const [layers, setLayers] = useState<FeatureLayer[]>([])
  const actionData = useActionData() as Awaited<ReturnType<typeof mapCreatorAction>>
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // ugh idk why assigning to a const makes typescript happy
    const l = actionData?.layer
    if (l) {
      setLayers(ls => [l, ...ls])
    }
  }, [actionData])


  const layerUrl = getQueryParameter("layer_url") ?? "";
  const [layer, setLayer] = useState<FeatureLayer | undefined>();
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filterExtent, setFilterExtent] = useState<Geometry | undefined>(
    undefined
  );
  const [where, setWhere] = useState(() => getQueryParameter("where") || "1=1");
  const [queryResults, setQueryResults] = useState<QueryResults | undefined>();
  const boundaryExtent = getQueryParameter("boundary") ?? "";

  useEffect(() => {
    if (layers.length > 0) {
      setLayer(layers[0])
    }
  }, [layers])

  useEffect(() => {
    if (layer?.loaded) {
      setSelectedFields(layer.fields.map((f) => f.name));
      setQueryResults(new QueryResults(layer, filterExtent));
    }
  }, [layer]);

  useEffect(() => {
    if (layer) {
      setQueryResults(new QueryResults(layer, filterExtent, 500));
    }
  }, [filterExtent, layer]);

  return (
    <div className="h-full p-2 pt-3">
      <div className="flex flex-row gap-1 min-h-full">
        <div className="w-3/12 max-w-xs p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">Layers</h5>
          </div>
          <div className="flow-root">
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
              {layers.map(({ url, sourceJSON }) =>
                <li key={url} className="flex flex-row items-center p-2 bg-white dark:bg-gray-800">
                  <div className="flex-1 min-w-0 max-w-xs">
                    <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                      <Link to={url}>
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
                        <svg className="w-5 h-5 pr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                          <path d="M17 4h-4V2a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2H1a1 1 0 0 0 0 2h1v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1a1 1 0 1 0 0-2ZM7 2h4v2H7V2Zm1 14a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0v8Zm4 0a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0v8Z" />
                        </svg>}>
                      Delete
                    </Dropdown.Item>
                  </Dropdown>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full flex-grow p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
          <Form method="post">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input type="search" name="layer-url" id="default-search" className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Paste URL or Search" required />
              <button type="submit" name="intent" value="load-layer" className="text-white text-sm absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Submit
              </button>
            </div>
          </Form>
          <ExtentPicker
            defaultBoundaryExtent={boundaryExtent}
            layer={layer}
            onFilterGeometryChange={(g) => setFilterExtent(g)}
            where={where}
          />
        </div>
        <div className="w-2/12 max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
          <Form className="space-y-6" method="post">
            <h5 className="text-xl font-medium text-gray-900 dark:text-white">Export</h5>

            <label htmlFor="format" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Format</label>
            <select id="format" name="format" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
              {Formats.map(format =>
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
      <AddLayerModal
        showModal={showModal}
        setShowModal={setShowModal}
      />
    </div>
  );
}


type AddLayerModalProps = {
  showModal: boolean
  setShowModal: (arg0: boolean) => void
}

function AddLayerModal({ showModal, setShowModal }: AddLayerModalProps) {

  const actionData = useActionData() as Awaited<ReturnType<typeof mapCreatorAction>>

  const layer: FeatureLayer | undefined = actionData?.layer

  return (
    <div id="add-layer-modal"
      tabIndex={-1}
      key="add-layer-modal"
      className={`${showModal ? "" : "hidden"} fixed bg-gray-600/80 left-0 right-0 z-50 items-center justify-center overflow-x-hidden overflow-y-auto top-4 md:inset-0 h-modal sm:h-full flex`}
      role="modal"
    >
      <div className="relative p-4 w-full max-w-5xl h-full md:h-auto">
        <div className="relative p-4 w-5/6 h-5/6 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
          <Form method="post">
            <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Layer To Map
              </h3>
              <div className="flex-grow" />
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={() => setShowModal(false)}
              >
                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <div className="grid gap-4 mb-4 sm:grid-cols-2">
              <div className="col-span-2">

                <div className="flex flex-col gap-4">
                  <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input type="search" name="layer-url" id="default-search" className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Paste URL or Search For Layer" required />
                    <button type="submit" name="intent" value="load-layer" className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                      Load
                    </button>
                  </div>
                  <div>
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Where</label>
                    <input type="text" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="1=1" />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button type="submit" name="intent" value="update" className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                  Add
                </button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
