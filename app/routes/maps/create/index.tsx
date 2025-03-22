import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { getQueryParameter } from "../../../url";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { getRealUrl, queryLayer, QueryResult } from "../../../arcgis";
import Geometry from "@arcgis/core/geometry/Geometry";
import { ActionFunctionArgs, Form, Link, Outlet, useFetcher, useLoaderData } from "react-router-dom";
import { Alert, Button, Checkbox, Dropdown, Modal, Progress, Table, TextInput } from "flowbite-react";
import { Drivers, GdalDownloader } from "../../../downloader";
import { getMapConfigLocal, saveMapConfigLocal } from "../../../database";

import { HiOutlineExclamationCircle, HiOutlineArrowCircleDown } from "react-icons/hi";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet";
import { EsriLayerWithConfig, raise } from "../../../types";
import { Dialog, Transition } from "@headlessui/react";

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
  const esriWithConfig: EsriLayerWithConfig[] = layers.map(esri => ({
    esri: esri,
    config: mapConfig.layers.find(l => l.url === getRealUrl(esri)) ?? raise("can't find feature layer")
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
  try {
    await Promise.all(promises)
  } catch (e) {
    const err = e as Error;
    errMsg = err.message
  }
  const esriWithConfig: EsriLayerWithConfig[] = layers.map(esri => ({
    esri: esri,
    config: mapConfig.layers.find(l => l.url === getRealUrl(esri)) ?? raise("can't find feature layer")
  }))
  return {
    mapConfig: mapConfig,
    layers: esriWithConfig,
    err: errMsg,
  }
}

export default function MapCreator() {

  const queryParam = useMemo(() => getQueryParameter("format"), []);

  const loaderData = useLoaderData() as Awaited<ReturnType<typeof mapCreatorLoader>>

  const [filterExtent, setFilterExtent] = useState<Geometry | undefined>(
    undefined
  );
  const [format, setFormat] = useState<keyof typeof Drivers>("GPKG")
  const [concurrent, setConcurrent] = useState(1)

  const [results, setResults] = useState<QueryResult[]>([])
  const [featDld, setFeatDld] = useState(0)

  const [downloader] = useState(new GdalDownloader((num) => setFeatDld(num)))
  const [totalFeatures, setTotalFeatures] = useState(0)
  const [percent, setPercent] = useState(0)


  const [showLoadingModal, setShowLoadingModal] = useState(false)
  const fetcher = useFetcher()
  // Show/hide modal based on fetcher state
  useEffect(() => {
    console.log(fetcher)
    if (fetcher.state === "submitting" || fetcher.state === "loading") {
      setShowLoadingModal(true);
    } else {
      setShowLoadingModal(false);
    }
  }, [fetcher.state]);

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

  return (
    <div className="p-2">
      <div className="flex flex-row gap-1">
        <div className="w-3/12 min-w-3/12 overflow-y-auto max-w-xs p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-dark-bg dark:border-gray-700">
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
              {loaderData.layers.length > 0 ? loaderData.layers.map((layer) =>
                <LayerDropdownMenu
                  key={layer.config.url}
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
        <div className="flex flex-col gap-2 w-full flex-grow p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8 dark:bg-dark-bg dark:border-gray-700">
          <fetcher.Form method="post">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input type="search" name="layer-url" id="default-search" className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-text-bg dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Add Layer Url Here (Like: https://gismaps.kingcounty.gov/arcgis/rest/services/Environment/KingCo_SensitiveAreas/MapServer/11)" required />
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
                    Loading layer {fetcher.formData?.get("layer-url") as string}
                  </h3>
                </div>
              </Modal.Body>
            </Modal>
          </fetcher.Form>
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
            <button className="w-full ml-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={() => {
                downloader.download(results, concurrent, format as string)
              }}
            >
              Download
            </button>
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
    </div>
  );
}

type LayerDropdownMenuProps = {
  layer: EsriLayerWithConfig
  boundary?: Geometry
}

function LayerDropdownMenu({ layer, boundary }: LayerDropdownMenuProps) {
  const { url, sourceJSON } = layer.esri
  const realUrl = getRealUrl(layer.esri)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [showConfigureModal, setShowConfigureModal] = useState(false)

  return <li key={url} className="flex flex-row items-center p-2 bg-white dark:bg-dark-bg">
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
      arrowIcon={false}
      label={
        <button className="hover:bg-gray-100 dark:bg-dark-bg dark:hover:bg-gray-700 p-2 rounded-lg">
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
        onClick={() => setShowConfigureModal(true)}
      >
        Filters & Attributes...
      </Dropdown.Item>
      <Dropdown.Item
        icon={() =>
          <svg className="w-5 h-5 pr-2 text-gray-800 dark:text-white" aria-hidden="true" fill="none" viewBox="0 0 18 18">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778" />
          </svg>
        }
        onClick={() => window.open(realUrl, "_blank")}
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
  const [where, setWhere] = useState(layer.config.where_clause ?? "1=1")

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
                        Configure Layer {layer.config.name}
                      </Dialog.Title>
                    </div>
                  </div>
                  <fetcher.Form action="/maps/create/layers/configure" method="post">
                    <div className="flex flex-col gap-2">
                      <input name="url" value={layer.config.url} className="hidden" readOnly />
                      <WhereInput defaultWhere={layer.config.where_clause ?? "1=1"} onUpdateClick={onUpdateClick} />
                      <div>
                        <div className="max-h-96 overflow-y-auto">
                          <Table striped hoverable className="border-gray-50 rounded-lg">
                            <Table.Head>
                              {fields.map(field =>
                                <Table.HeadCell key={field.name} >
                                  <div className="flex flex-col items-center gap-1">
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 place-self-start">{field.name}</p>
                                    <div className="flex flex-row gap-2 items-center">
                                      <Checkbox defaultChecked={layer.config.column_mapping ? layer.config.column_mapping[field.name] : true} name={`${field.name}-enabled`} />
                                      <TextInput sizing="sm"
                                        id={field.name}
                                        name={`${field.name}-new`}
                                        defaultValue={layer.config.column_mapping ? layer.config.column_mapping[field.name] ?? field.name : field.name}
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
      <p className="mt-2 text-xs text-red-800 dark:text-red-800 place-self-start">The Edit Columns feature doesn't work yet</p>
    </div>
  )
}
