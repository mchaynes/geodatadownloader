import { useCallback } from "react";
import { useEffect, useRef, useState } from "react";
import { setLoadingWhile } from "./loading";
import { getRealUrl, parseGeometryFromString } from "./arcgis";

import Edit from "@mui/icons-material/Edit";
import EditOff from "@mui/icons-material/EditOff";
import Geometry from "@arcgis/core/geometry/Geometry";
import {
  equals,
  union as geometryUnion,
} from "@arcgis/core/geometry/geometryEngine";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Sketch from "@arcgis/core/widgets/Sketch";
import MapView from "@arcgis/core/views/MapView";
import EsriMap from "@arcgis/core/Map";
import FeatureEffect from "@arcgis/core/layers/support/FeatureEffect";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";
import Graphic from "@arcgis/core/Graphic";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import { AlertType, StatusAlert } from "./StatusAlert";
import BasemapToggle from "@arcgis/core/widgets/BasemapToggle";
import Basemap from "@arcgis/core/Basemap";
import CopyButton from "./CopyButton";
import { useMediaQuery } from "usehooks-ts";
import { mapCreatorLoader } from "./routes/maps/create";
import { ActionFunctionArgs, useFetcher, useLoaderData, useSearchParams } from "react-router-dom";
import { getMapConfigLocal, saveMapConfigLocal } from "./database";
import { Button, Tooltip } from "flowbite-react";
import { useMapViewContext } from "./MapViewContext";

const GEOMETRY_LINK =
  "https://developers.arcgis.com/documentation/common-data-types/geometry-objects.htm";
const esriDocLinkProps = (t: "POLYGON" | "ENVELOPE") => ({
  rel: "noreferrer",
  target: "_blank",
  href: `${GEOMETRY_LINK}#${t}`,
});


export const extentPickerAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const boundary = formData.get("boundary") as string
  const mapConfig = await getMapConfigLocal()
  mapConfig.map.boundary = boundary
  saveMapConfigLocal(mapConfig)
  return boundary
}


export function ExtentPicker() {

  const params = useSearchParams()
  const extent = params["extent"]
  const data = useLoaderData() as Awaited<ReturnType<typeof mapCreatorLoader>>
  const fetcher = useFetcher()
  const { layers, mapConfig } = data
  const { setMapView } = useMapViewContext();
  
  // Form State variables
  const [loading, setLoading] = useState(false);
  const [boundaryErrMsg, setBoundaryErrMsg] = useState("");
  const [boundaryAlertType, setBoundaryAlertType] =
    useState<AlertType>(undefined);
  const [textBoxDisabled, setTextBoxDisabled] = useState(false);
  const [textBoxValue, setTextBoxValue] = useState<string>(
    typeof mapConfig.map.boundary === "string" ?
      mapConfig.map.boundary : ""
  );

  // ArcGIS Map State  variables
  const elRef = useRef(null);
  const [filterGeometry, setFilterGeometry] = useState<Geometry | undefined>();
  const [map] = useState(
    () =>
      new EsriMap({
        basemap: Basemap.fromId("topo-vector"),
      })
  );

  const [mapView] = useState(
    () =>
      new MapView({
        map: map,
        center: [-97.498699, 39.079974],
        zoom: 3,
        popup: {
          dockEnabled: true,
          dockOptions: {
            buttonEnabled: false,
            breakpoint: false
          }
        }
      })
  );
  const [sketchLayer] = useState(() => new GraphicsLayer());
  const [sketch] = useState(
    () =>
      new Sketch({
        layer: sketchLayer,
        view: mapView,
        creationMode: "update",
        availableCreateTools: ["polygon", "rectangle", "circle"],
        layout: "vertical",
        defaultUpdateOptions: {
          enableRotation: false,
          enableScaling: false,
          toggleToolOnClick: false
        }
      })
  );

  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)")

  const [basemapToggle] = useState<BasemapToggle>(
    () =>
      new BasemapToggle({
        view: mapView,
        nextBasemap: "hybrid",
      })
  );

  // Updates filterGeometry and textBoxValue when sketchLayer is updated
  const onSketchUpdate = useCallback(() => {
    const sketchGeometries = sketchLayer.graphics
      ?.filter((g) => g?.geometry?.spatialReference !== undefined)
      .map((g) => g.geometry);
    // If there's any sketchGeometries defined, union those geometries into a single
    // filter geometry so the query can be updated
    if (sketchGeometries && sketchGeometries.length > 0) {
      const unionedGeometry = geometryUnion(sketchGeometries.toArray());
      setFilterGeometry(unionedGeometry);
      const stringGeometry = JSON.stringify(unionedGeometry.toJSON());
      setTextBoxValue(stringGeometry);
      setBoundaryErrMsg("");
      setTextBoxDisabled(true);
    } else {
      setFilterGeometry(undefined);
      setTextBoxValue("");
    }
  }, [sketchLayer, fetcher]);

  useEffect(() => {
    if (textBoxValue !== mapConfig.map.boundary && fetcher.state === "idle") {
      fetcher.submit(
        { boundary: textBoxValue },
        { method: "post", action: "/maps/create/boundary" })
    }
  }, [fetcher, textBoxValue])

  // Ensure MapView popup is always enabled
  useEffect(() => {
    if (mapView && mapView.popup) {
      mapView.popup.autoOpenEnabled = true;
    }
  }, [mapView])

  // Dynamically load ArcGIS theme based on dark mode preference
  useEffect(() => {
    const themeLink = document.getElementById('arcgis-theme') as HTMLLinkElement;
    const themePath = prefersDark
      ? "https://js.arcgis.com/4.22/@arcgis/core/assets/esri/themes/dark/main.css"
      : "https://js.arcgis.com/4.22/@arcgis/core/assets/esri/themes/light/main.css";

    if (themeLink) {
      themeLink.href = themePath;
    } else {
      // Create the theme link if it doesn't exist
      const link = document.createElement('link');
      link.id = 'arcgis-theme';
      link.rel = 'stylesheet';
      link.href = themePath;
      document.head.appendChild(link);
    }
  }, [prefersDark])

  // Set the mapView in context when it's created
  useEffect(() => {
    setMapView(mapView);
    return () => setMapView(undefined);
  }, [mapView, setMapView]);

  // Attaches map to ref
  useEffect(() => {
    async function attachView() {
      await setLoadingWhile(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
        mapView.container = elRef.current as any;
        await mapView.when();
      }, setLoading);
    }
    void attachView();
  }, [layers, mapView]);

  // Add sketch widget to map
  useEffect(() => {
    mapView.ui.add(sketch, "top-right");
    return () => mapView.ui.remove(sketch);
  }, [mapView, sketch]);

  // Register update listen for new sketch geometries to set filterGeometry
  useEffect(() => {
    sketch.on("update", onSketchUpdate);
  }, [sketch, onSketchUpdate]);

  // Add the sketch widget to the map
  useEffect(() => {
    map.add(sketchLayer);
  }, [map, sketchLayer]);

  // Layer visibility is now managed by individual LayerDropdownMenu components
  // This ensures dynamic toggling works correctly without conflicts

  useEffect(() => {
    mapView.ui.add(basemapToggle, "bottom-left");

    // Listen for basemap toggle changes to update nextBasemap
    const handle = basemapToggle.watch("activeBasemap", () => {
      const themeBasemap = prefersDark ? "dark-gray-vector" : "topo-vector";
      const currentBasemapId = map.basemap.id;

      if (currentBasemapId === "hybrid") {
        basemapToggle.set("nextBasemap", themeBasemap);
      } else {
        basemapToggle.set("nextBasemap", "hybrid");
      }
    });

    return () => {
      mapView.ui.remove(basemapToggle);
      handle.remove();
    };
  }, [mapView, basemapToggle, map, prefersDark]);

  useEffect(() => {
    const modeToId = (prefersDark: boolean) => {
      if (prefersDark) {
        return "dark-gray-vector"
      }
      return "topo-vector"
    };
    const themeBasemap = modeToId(prefersDark);
    const currentBasemapId = map.basemap.id;

    // Only switch basemap if we're on a theme-based basemap (not satellite)
    // This preserves satellite view when theme changes
    if (currentBasemapId === "topo-vector" || currentBasemapId === "dark-gray-vector") {
      if (themeBasemap !== currentBasemapId) {
        map.set("basemap", Basemap.fromId(themeBasemap));
      }
    }

    // Update the toggle's next basemap based on current state
    if (currentBasemapId === "hybrid") {
      // If on satellite, next should be the theme-appropriate basemap
      basemapToggle.set("nextBasemap", themeBasemap);
    } else {
      // If on theme basemap, next should be satellite
      basemapToggle.set("nextBasemap", "hybrid");
    }
  }, [map, prefersDark, basemapToggle]);

  // Grayscale out non-included layers.
  useEffect(() => {
    if (layers && filterGeometry) {
      for (const layer of layers) {
        layer.esri.featureEffect = new FeatureEffect({
          filter: new FeatureFilter({
            geometry: filterGeometry,
            spatialRelationship: "intersects",
            where: mapConfig.layers.find(l => l.url === getRealUrl(layer.esri))?.where_clause ?? "1=1",
          }),
          excludedEffect: "grayscale(100%) opacity(30%)",
        })
      }
    }
  }, [layers, filterGeometry, mapConfig]);


  // Test if new text in TextField contains filter geometry
  // If so, update filterGeometry and remove any previous geometries on the layer
  const onTextBoxChange = useCallback(
    async (val: string) => {
      setTextBoxValue(val);
      await setLoadingWhile(async () => {
        try {
          const geo = parseGeometryFromString(val);
          // If the change hasn't actually changed the geometry, bail out of expensive op early
          if (filterGeometry && equals(geo, filterGeometry)) {
            return;
          }
          sketchLayer.removeAll();
          sketchLayer.add(
            new Graphic({
              symbol: new SimpleFillSymbol({
                style: "solid",
                color: [150, 150, 150, 0.2],
                outline: {
                  color: "black",
                  width: 2,
                },
              }),
              geometry: geo,
            })
          );
          setFilterGeometry(geo);
          // we made it here, so reset the alertType so it doesn't show
          setBoundaryAlertType(undefined);
        } catch (e) {
          // We can't parse text for some reason, so assume no filterGeometry
          setFilterGeometry(undefined);
          sketchLayer.removeAll();
          // If there's text in the TextField and we're here, that's an error so let the user know
          if (val) {
            const err = e as Error;
            setBoundaryErrMsg(err.message);
            setBoundaryAlertType("error");
          }
        }
      }, setLoading);
    },
    [filterGeometry, sketchLayer, mapView, setLoading]
  );

  useEffect(() => {
    if (mapConfig.map.boundary) {
      onTextBoxChange(mapConfig.map.boundary as string)
      setTextBoxDisabled(true)
    }
  }, [])

  // ExtentAdornment contains an EditToggle and a Copy to Clipboard button
  function BoundaryAdornment({ content }: { content: string }) {
    const handleEditClick = () => {
      setTextBoxDisabled((d) => !d);
    };
    return (
      <div className="flex flex-row gap-1">
        <CopyButton data={content} />
        <Tooltip
          placement="top-start"
          content={textBoxDisabled ? "Enable editing" : "Disable editing"}
        >
          <Button
            className="text-gray-500 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 w-10 h-10"
            id="extent-edit-toggle"
            aria-label="toggle extent textbox editing"
            onClick={handleEditClick}
          >
            {textBoxDisabled ? <Edit /> : <EditOff />}
          </Button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="dark:bg-dark-bg" style={{ display: "flex", flexDirection: "column", gap: ".5rem .5rem" }}>
      <div ref={elRef} className="w-full h-[63vh]" />
      <div className="flex flex-row gap-1">

        <input

          className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-dark-text-bg dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          type="search"
          name="layer-url"
          id="boundary-text-field"
          value={textBoxValue}
          placeholder="Draw on map using tools (Or you can also paste a JSON boundary in this box)"
          onChange={e => onTextBoxChange(e.currentTarget.value)}
          required
          {...(textBoxDisabled ? { readOnly: true } : {})}
        />
        <BoundaryAdornment content={textBoxValue} />
      </div>
      <StatusAlert
        msg={
          <div>
            Error parsing your boundary, you probably mistyped. Supported
            Formats: <a {...esriDocLinkProps("POLYGON")}>Polygon</a>,{" "}
            <a {...esriDocLinkProps("ENVELOPE")}>Envelope</a>
            <p />
            <code>
              {"    "}
              {boundaryErrMsg}
            </code>
          </div>
        }
        alertType={boundaryAlertType}
        loading={loading}
      />
    </div>
  );
}
