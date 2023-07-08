import { useCallback, useContext } from "react";
import { useEffect, useRef, useState } from "react";
import { setLoadingWhile } from "./loading";
import { GeometryUpdateListener, getRealUrl, parseGeometryFromString } from "./arcgis";

import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
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
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import BasemapToggle from "@arcgis/core/widgets/BasemapToggle";
import Basemap from "@arcgis/core/Basemap";
import CopyButton from "./CopyButton";
import { useMediaQuery } from "usehooks-ts";
import { mapCreatorLoader } from "./routes/maps/create";
import { ActionFunctionArgs, useFetcher, useLoaderData, useParams, useSearchParams } from "react-router-dom";
import { getMapConfigLocal, saveMapConfigLocal } from "./database";

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
  // Form State variables
  const [loading, setLoading] = useState(false);
  const [boundaryErrMsg, setBoundaryErrMsg] = useState("");
  const [boundaryAlertType, setBoundaryAlertType] =
    useState<AlertType>(undefined);
  const [textBoxDisabled, setTextBoxDisabled] = useState(false);
  const [textBoxValue, setTextBoxValue] = useState<string>(() => {
    return typeof mapConfig.map.boundary === "string" ?
      mapConfig.map.boundary : ""
  });

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
      })
  );

  const [basemapToggle] = useState<BasemapToggle>(
    () =>
      new BasemapToggle({
        view: mapView,
        nextBasemap: "dark-gray-vector",
      })
  );

  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)")

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

  useEffect(() => {
    if (!layers) {
      return;
    }
    for (const layer of layers) {
      map.add(layer);
    }
    return () => {
      for (const layer of layers) {
        map.remove(layer);
      }
    };
  }, [map, layers]);

  useEffect(() => {
    mapView.ui.add(basemapToggle, "bottom-left");
    return () => mapView.ui.remove(basemapToggle);
  }, [mapView, basemapToggle]);

  useEffect(() => {
    const modeToId = (prefersDark: boolean) => {
      if (prefersDark) {
        return "dark-gray-vector"
      }
      return "topo-vector"
    };
    // toggle basemap depending on dark vs light mode in the theme
    if (modeToId(prefersDark) !== map.basemap.id) {
      const prevMap = map.basemap.id;
      map.set("basemap", Basemap.fromId(modeToId(prefersDark)));
      basemapToggle
        .toggle()
        .then(() => {
          basemapToggle.set("nextBasemap", prevMap);
        })
        .catch((err) => console.error(err));
    }
  }, [map, prefersDark, basemapToggle]);

  // Grayscale out non-included layers.
  useEffect(() => {
    if (layers) {
      for (const layer of layers) {
        layer.featureEffect = new FeatureEffect({
          filter: new FeatureFilter({
            geometry: filterGeometry,
            spatialRelationship: "intersects",
            where: mapConfig.layers.find(l => l.url === getRealUrl(layer))?.where_clause ?? "1=1",
          }),
          excludedEffect: "grayscale(100%) opacity(30%)",
        })
      }
    }

  }, [filterGeometry]);

  useEffect(() => {
    if (sketch) {
      mapView.goTo(sketch.layer.fullExtent)
    }
  }, [mapView, sketch])


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
  }, [mapConfig])

  // ExtentAdornment contains an EditToggle and a Copy to Clipboard button
  function BoundaryAdornment({ content }: { content: string }) {
    const handleEditClick = () => {
      setTextBoxDisabled((d) => !d);
    };
    return (
      <InputAdornment position="end">
        <Stack direction="row">
          <CopyButton data={content} />
          <Tooltip
            placement="top-start"
            title={textBoxDisabled ? "Enable editing" : "Disable editing"}
          >
            <IconButton
              id="extent-edit-toggle"
              aria-label="toggle extent textbox editing"
              onClick={handleEditClick}
            >
              {textBoxDisabled ? <Edit /> : <EditOff />}
            </IconButton>
          </Tooltip>
        </Stack>
      </InputAdornment>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: ".5rem .5rem" }}>
      <div ref={elRef} className="w-full h-[63vh]" />
      <TextField
        id="boundary-text-field"
        variant="outlined"
        label="Boundary"
        placeholder="You can also paste in a boundary defined by JSON"
        fullWidth
        disabled={textBoxDisabled}
        value={textBoxValue}
        onChange={(e) => void onTextBoxChange(e.currentTarget.value)}
        size="small"
        InputProps={{
          endAdornment: <BoundaryAdornment content={textBoxValue} />,
        }}
      />
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
