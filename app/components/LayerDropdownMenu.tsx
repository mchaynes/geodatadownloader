import React, { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { Link, useFetcher } from "react-router-dom";
import { Button, Checkbox, Dropdown, Modal, Table, TextInput } from "flowbite-react";
import Geometry from "@arcgis/core/geometry/Geometry";
import Extent from "@arcgis/core/geometry/Extent";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Dialog, Transition } from "@headlessui/react";
import { useMapView } from "../MapViewContext";
import { getRealUrl } from "../arcgis";
import { EsriLayerWithConfig } from "../types";
import { getMapConfigSync, saveMapConfigLocal } from "../database";

type LayerDropdownMenuProps = {
  layer: any;
  boundary?: Geometry;
};

export function LayerDropdownMenu({ layer, boundary }: LayerDropdownMenuProps) {
  const { url, sourceJSON } = layer.esri;
  const realUrl = getRealUrl(layer.esri);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const mapView = useMapView();
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

        // Ensure popup template is set before adding to map
        if (!layer.esri.popupTemplate) {
          const template = layer.esri.createPopupTemplate();
          layer.esri.popupTemplate = template;
        }
        layer.esri.popupEnabled = true;

        // Add layer to map if not already present
        if (!mapView.map.layers.includes(layer.esri)) {
          mapView.map.add(layer.esri);
        }
      } else {
        // Remove layer from map if present
        if (mapView.map.layers.includes(layer.esri)) {
          mapView.map.remove(layer.esri);
        }
      }
    };

    setupLayer().catch((err) => console.error("Error setting up layer:", err));

    // Cleanup: remove layer when component unmounts
    return () => {
      if (mapView.map && mapView.map.layers.includes(layer.esri)) {
        mapView.map.remove(layer.esri);
      }
    };
  }, [isVisible, mapView, layer.esri]);

  function closeDropdown() {
    if (isDropDownOpen) {
      triggerRef.current?.click();
      setIsDropDownOpen(false);
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
      closeDropdown();
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isDropDownOpen]);

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
      spatialReference: extentData.spatialReference,
    });

    console.log("Created extent object:", extent);

    mapView
      .when(() => {
        console.log("MapView is ready, calling goTo...");
        mapView
          .goTo(extent, {
            animate: true,
            duration: 1000,
          })
          .then(() => {
            console.log("Successfully zoomed to layer extent");
          })
          .catch((err) => {
            console.error(`Error zooming to layer "${sourceJSON["name"]}" (${realUrl}):`, err);
          });
      })
      .catch((err) => {
        console.error("MapView not ready:", err);
      });
  }, [mapView, sourceJSON, realUrl]);

  return (
    <li ref={containerRef} key={url} className="flex flex-row items-center p-2 bg-white dark:bg-dark-bg">
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
            window.dispatchEvent(new Event("layerVisibilityChanged"));
          }
        }}
        className="mr-2"
      />
      <div className="flex-1 min-w-0 max-w-xs">
        <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
          <Link to={realUrl} target="_blank">
            {sourceJSON["name"]}
          </Link>
        </p>
        <p className="text-sm text-gray-500 truncate dark:text-gray-400">{sourceJSON["description"]}</p>
      </div>
      <Dropdown
        className="dark:text-white dark:bg-dark-bg"
        inline
        dismissOnClick={true}
        arrowIcon={false}
        label={
          <button
            ref={triggerRef}
            onClick={() => setIsDropDownOpen((prev) => !prev)}
            className="hover:bg-gray-100 dark:bg-dark-bg dark:hover:bg-gray-700 p-2 rounded-lg"
          >
            <svg
              className="w-4 h-4 text-gray-800 dark:text-white "
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 4 15"
            >
              <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
            </svg>
          </button>
        }
      >
        <Dropdown.Item
          icon={() => (
            <svg
              className="w-5 h-5 pr-2 text-gray-800 dark:text-white"
              aria-hidden
              fill="currentColor"
              viewBox="0 0 20 14"
            >
              <path d="M18 0H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM2 6h7v6H2V6Zm9 6V6h7v6h-7Z" />
            </svg>
          )}
          onClick={() => {
            closeDropdown();
            setShowConfigureModal(true);
          }}
        >
          Filters & Attributes...
        </Dropdown.Item>
        <Dropdown.Item
          icon={() => (
            <svg
              className="w-5 h-5 pr-2 text-gray-800 dark:text-white"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
          onClick={() => {
            closeDropdown();
            handleZoomToLayer();
          }}
        >
          Zoom to Layer
        </Dropdown.Item>
        <Dropdown.Item
          icon={() => (
            <svg
              className="w-5 h-5 pr-2 text-gray-800 dark:text-white"
              aria-hidden="true"
              fill="none"
              viewBox="0 0 18 18"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778"
              />
            </svg>
          )}
          onClick={() => {
            closeDropdown();
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
          icon={() => (
            <svg className="w-5 h-5 pr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 18 20">
              <path d="M17 4h-4V2a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2H1a1 1 0 0 0 0 2h1v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1a1 1 0 1 0 0-2ZM7 2h4v2H7V2Zm1 14a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0v8Zm4 0a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0v8Z" />
            </svg>
          )}
          onClick={() => {
            closeDropdown();
            setShowRemoveModal(true);
          }}
        >
          Remove
        </Dropdown.Item>
      </Dropdown>
      <RemoveLayerModal show={showRemoveModal} setShow={setShowRemoveModal} url={realUrl} />
      <ModifyLayerConfig show={showConfigureModal} setShow={setShowConfigureModal} layer={layer} boundary={boundary} />
    </li>
  );
}

type RemoveLayerModalProps = {
  url: string;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
};

function RemoveLayerModal({ url, show, setShow }: RemoveLayerModalProps) {
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data === "removed") {
      setShow(false);
    }
  }, [fetcher.data, setShow]);

  return (
    <Modal show={show} size="md" onClose={() => setShow(false)} popup dismissible>
      <Modal.Header />
      <Modal.Body>
        <fetcher.Form action="/maps/create/remove-layer" method="post">
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              {url ? "Are you sure you want to remove layer?" : "Are you sure you want to remove all layers?"}
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
  );
}

type ModifyLayerConfigProps = {
  layer: EsriLayerWithConfig;
  show: boolean;
  boundary?: Geometry;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
};

function ModifyLayerConfig({ show, setShow, boundary, layer }: ModifyLayerConfigProps) {
  const fields = layer.esri.fields;
  const [results, setResults] = useState<FeatureSet>();
  const fetcher = useFetcher();
  const [where, setWhere] = useState(layer?.config?.where_clause ?? "1=1");

  const cancelButtonRef = useRef(null);

  const onUpdateClick = async (where: string) => {
    setWhere(where);
    setResults(
      await layer.esri.queryFeatures({
        where: where,
        geometry: boundary,
        num: 20,
        outFields: ["*"],
        returnGeometry: true,
      })
    );
  };

  useEffect(() => {
    onUpdateClick(where);
  }, []);

  useEffect(() => {
    if (fetcher.data) {
      setShow(false);
    }
  }, [fetcher, setShow]);

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
                        <label className="block mb-2 text-sm font-medium leading-6 text-gray-900 dark:text-white">
                          Select and Rename Columns
                        </label>
                        <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                          <Table striped hoverable>
                            <Table.Head>
                              <Table.HeadCell className="w-12">Include</Table.HeadCell>
                              <Table.HeadCell className="w-1/3">Original Name</Table.HeadCell>
                              <Table.HeadCell className="w-1/3">New Name</Table.HeadCell>
                              <Table.HeadCell>Sample Value</Table.HeadCell>
                            </Table.Head>
                            <Table.Body className="divide-y">
                              {fields.map((field) => {
                                const isSelected = layer?.config?.column_mapping
                                  ? field.name in (layer.config.column_mapping as Record<string, string>)
                                  : true;
                                const newName = layer?.config?.column_mapping
                                  ? (layer.config.column_mapping as Record<string, string>)[field.name] ?? field.name
                                  : field.name;
                                const sampleValue = results?.features?.[0]?.getAttribute(field.name);
                                return (
                                  <Table.Row key={field.name} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                    <Table.Cell>
                                      <Checkbox defaultChecked={isSelected} name={`${field.name}-enabled`} />
                                    </Table.Cell>
                                    <Table.Cell className="font-medium text-gray-900 dark:text-white">{field.name}</Table.Cell>
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
                                      {sampleValue !== null && sampleValue !== undefined ? String(sampleValue) : "—"}
                                    </Table.Cell>
                                  </Table.Row>
                                );
                              })}
                            </Table.Body>
                          </Table>
                        </div>
                      </div>
                      <div className="flex flex-row justify-end">
                        <Button
                          type="submit"
                          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                          name="intent"
                          value="save-layer"
                        >
                          Save
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
  );
}

type WhereInputProps = {
  onUpdateClick: (_: string) => void;
  defaultWhere?: string;
};

function WhereInput({ defaultWhere, onUpdateClick }: WhereInputProps) {
  const [where, setWhere] = useState(defaultWhere ? defaultWhere : "1=1");
  return (
    <div>
      <label htmlFor="where" className="block mb-2 text-sm font-medium leading-6 text-gray-900 dark:text-white">
        Where Clause
      </label>
      <div className="flex flex-row">
        <input
          type="search"
          name="where"
          id="where"
          className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-text-bg dark:border-slate-600 dark:placeholder-slate-400 dark:text-white dark:focus:ring-slate-500 dark:focus:border-slate-500"
          required
          value={where}
          onChange={(e) => {
            e.preventDefault();
            setWhere(e.currentTarget.value);
          }}
        />
        <div className="inset-y-0 right-0 flex items-center">
          <button
            type="button"
            name="intent"
            value="modify-where"
            className="rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
            onClick={() => onUpdateClick(where)}
          >
            Refresh
          </button>
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-300 place-self-start">Use original column names in query</p>
    </div>
  );
}
