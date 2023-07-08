import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { getQueryParameter } from "../../../url";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getRealUrl, QueryResults } from "../../../arcgis";
import Geometry from "@arcgis/core/geometry/Geometry";
import { ExtentPicker } from "../../../ExtentPicker";
import { ActionFunctionArgs, Form, Link, Outlet, useActionData, useFetcher, useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Checkbox, Dropdown, Label, Modal, Table, TextInput } from "flowbite-react";
import { Drivers, GdalDownloader } from "../../../downloader";
import ConfigureLayerModal from "../../../ConfigureLayerModal";
import { getMapConfigLocal, saveMap, saveMapConfigLocal } from "../../../database";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet";
import { LayerWithConfig } from "../../../types";

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
  if (formData.get("intent") === "save-map") {
    await saveMap(mapConfig)
  }
  if (formData.get("intent") === "modify-where") {
    console.log(formData.entries())
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
  try {
    await Promise.all(promises)
  } catch (e) {
    const err = e as Error;
    errMsg = err.message
  }
  return {
    mapConfig: mapConfig,
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

  const [filterExtent, setFilterExtent] = useState<Geometry | undefined>(
    undefined
  );
  const [format, setFormat] = useState<keyof typeof Drivers>("GPKG")


  const [showRemoveModal, setShowRemoveModal] = useState(false)

  return (
    <div className="h-full p-2 pt-3">
      <div className="flex flex-row gap-1 max-h-[85vh]">
        <div className="w-3/12 min-w-3/12 max-h-full overflow-y-auto max-w-xs p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">Layers</h5>

            <button
              onClick={() => setShowRemoveModal(srm => !srm)}
              className="inline-flex items-center p-2 text-sm font-medium rounded-lg text-primary-700 hover:bg-gray-100 dark:text-primary-500 dark:hover:bg-gray-700">
              Remove All
            </button>
            <RemoveLayerModal
              url=""
              show={showRemoveModal}
              setShow={setShowRemoveModal}
            />
          </div>

          <div className="flow-root">
            <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
              {layers.length > 0 ? layers.map((layer) =>
                <LayerDropdownMenu
                  key={layer.id}
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
        </div>
        <div className="flex flex-col gap-2 w-full flex-grow p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-gray-800 dark:border-gray-700">
          <Form method="post">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input type="search" name="layer-url" id="default-search" className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="https://gismaps.kingcounty.gov/arcgis/rest/services/Environment/KingCo_SensitiveAreas/MapServer/11" required />
              <button type="submit" name="intent" value="add-layer" className="text-white text-sm absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                Add
              </button>
            </div>
          </Form>
          <Outlet />
        </div>
        <div className="w-2/12 max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
          <Form className="space-y-6" method="post">
            <label htmlFor="format" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Format</label>
            <select id="format" name="format" defaultValue={exportType} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onSelect={e => setFormat(e.currentTarget.value)}
            >
              {Object.keys(Drivers).map(format =>
                <option key={format} value={format}>{format}</option>
              )}
            </select>

            <label htmlFor="steps-range" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Concurrent Requests</label>
            <input id="steps-range" type="range" min="1" max="5" defaultValue="1" step="1" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
            <button
              type="submit"
              name="intent"
              value="save-map"
              className="w-full text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            >
              Save Map
            </button>
            <button className="w-full text-white bg-orange-700 hover:bg-orange-800 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-800"
            >
              Schedule
            </button>
            <button className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={() => {
                const results = layers.map(l => new QueryResults(l, filterExtent))
                const downloader = new GdalDownloader((f) => console.log(f))
                downloader.download(results, 1, "1=1", format as string)
              }}
            >
              Download
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}

type LayerDropdownMenuProps = {
  layer: FeatureLayer
  boundary?: Geometry
}

function LayerDropdownMenu({ layer, boundary }: LayerDropdownMenuProps) {
  const { url, sourceJSON } = layer
  const realUrl = getRealUrl(layer)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [showConfigureModal, setShowConfigureModal] = useState(false)
  const loaderData = useLoaderData() as Awaited<ReturnType<typeof mapCreatorLoader>>

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
      arrowIcon={false}
      label={
        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" fill="currentColor" viewBox="0 0 4 15">
          <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
        </svg>
      }
    >
      <Dropdown.Item
        icon={() =>
          <svg className="w-5 h-5 pr-2 text-gray-800 dark:text-white" aria-hidden fill="currentColor" viewBox="0 0 20 14">
            <path d="M18 0H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM2 6h7v6H2V6Zm9 6V6h7v6h-7Z" />
          </svg>}
        onClick={() => setShowConfigureModal(true)}
      >
        Configure
      </Dropdown.Item>
      <Dropdown.Item
        icon={() =>
          <svg className="w-5 h-5 pr-2 text-gray-800 dark:text-white" aria-hidden="true" fill="none" viewBox="0 0 18 18">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778" />
          </svg>
        }
      >
        <Link to={realUrl} target="_blank">
          View
        </Link>
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item
        className="text-red-500 dark:text-red-50"
        icon={() =>
          <svg className="w-5 h-5 pr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 18 20">
            <path d="M17 4h-4V2a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2H1a1 1 0 0 0 0 2h1v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1a1 1 0 1 0 0-2ZM7 2h4v2H7V2Zm1 14a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0v8Zm4 0a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0v8Z" />
          </svg>
        }
        onClick={() => setShowRemoveModal(true)}
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
      layerConfig={loaderData.mapConfig.layers.find(l => l.url === realUrl)}
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
  layer: FeatureLayer
  layerConfig?: LayerWithConfig
  show: boolean
  boundary?: Geometry
  setShow: React.Dispatch<React.SetStateAction<boolean>>
}

function ModifyLayerConfig({ show, setShow, layer, boundary, layerConfig }: ModifyLayerConfigProps) {
  const fields = layer.fields
  const [results, setResults] = useState<FeatureSet>()
  const fetcher = useFetcher()
  const [where, setWhere] = useState(layerConfig?.where_clause ?? "1=1")

  const onUpdateClick = async (where: string) => {
    setWhere(where)
    setResults(await layer.queryFeatures({
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

  return (
    <Modal show={show} size="3xl" onClose={() => setShow(false)} popup dismissible>
      <Modal.Header className="p-4">
        Modify Layer Properties: <strong>{layer.sourceJSON["name"]}</strong>
      </Modal.Header>
      <Modal.Body className="h-96">
        <fetcher.Form action="/maps/create/layers/configure" method="post">
          <div className="flex flex-col gap-2">
            <input name="url" value={getRealUrl(layer)} className="hidden" readOnly />
            <input name="where" value={where} className="hidden" readOnly />
            <WhereInput defaultWhere={layerConfig?.where_clause ?? "1=1"} onUpdateClick={onUpdateClick} />
            <div>
              <div className="max-h-96 overflow-y-auto">
                <Table striped hoverable className="border-gray-50 rounded-lg">
                  <Table.Head>
                    {fields.map(field =>
                      <Table.HeadCell key={field.name} >
                        <div className="flex flex-col items-center gap-1">
                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 place-self-start">{field.name}</p>
                          <div className="flex flex-row gap-2 items-center">
                            <Checkbox defaultChecked={layerConfig?.column_mapping ? layerConfig?.column_mapping[field.name] : true} name={`${field.name}-enabled`} />
                            <TextInput sizing="sm"
                              id={field.name}
                              name={`${field.name}-new`}
                              defaultValue={layerConfig?.column_mapping ? layerConfig?.column_mapping[field.name] ?? field.name : field.name}
                              required
                            />
                          </div>
                        </div>
                      </Table.HeadCell>
                    )}
                  </Table.Head>
                  <Table.Body className="divide-y">
                    {results?.features.map((feature, i) =>
                      <Table.Row key={i} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                        {fields.map(({ name }) =>
                          <Table.Cell key={name} className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                            {feature.getAttribute(name)}
                          </Table.Cell>
                        )}
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table>
              </div>
            </div>
            <div className="flex flex-row">
              <div className="flex-grow text-sm text-gray-500 truncate dark:text-gray-400">
                Displaying first {results?.features.length} features
              </div>
              <Button type="submit"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                name="intent"
                value="save-layer"
              >Save</Button>
            </div>
          </div>
        </fetcher.Form>
      </Modal.Body>
    </Modal>
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
      <div className="relative">
        <label htmlFor="where" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Where Clause</label>
        <input type="search" name="where" id="where" className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required
          value={where}
          onChange={(e) => {
            e.preventDefault()
            setWhere(e.currentTarget.value)
          }}
        />
        <button type="button" name="intent" value="modify-where"
          className="p-2 text-white text-sm absolute right-2 bottom-1.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          onClick={() => onUpdateClick(where)}
        >
          Refresh
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Use original column names in query</p>
    </div>
  )
}
