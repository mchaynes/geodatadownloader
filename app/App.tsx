import { ThemeProvider } from "@emotion/react";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import {
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { WelcomeMessage } from "./WelcomeMessage";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { getQueryParameter } from "./url";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { useEffect, useMemo, useState } from "react";
import { PickLayer } from "./PickLayer";
import { QueryResults } from "./arcgis";
import Geometry from "@arcgis/core/geometry/Geometry";
import { Where } from "./Where";
import { AttributeTablePreview } from "./AttributeTablePreview";
import { ExtentPicker } from "./ExtentPicker";
import { DownloaderForm } from "./Downloader";

type SupportedExportType = string;

function isSupportedExportType(
  value: string | null
): value is SupportedExportType {
  return (
    typeof value === "string" &&
    ["gpkg", "geojson", "csv", "shp"].includes(value)
  );
}

export default function App() {
  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));

  const queryParam = useMemo(() => getQueryParameter("format"), []);
  const [exportType, setExportType] = useState<SupportedExportType>(
    isSupportedExportType(queryParam) ? queryParam : "gpkg"
  );
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
    <Container
      maxWidth={false}
      sx={{
        display: "flex",
        flexDirection: "column",
        paddingTop: "1rem",
        paddingBottom: "2rem",
      }}
    >
      <PickLayer defaultLayerUrl={layerUrl} onLayerLoad={setLayer} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "stretch",
          }}
        >
          <div
            style={{
              display: "flex",
              flexGrow: 1,
              flexDirection: "column",
              justifyItems: "stretch",
              alignSelf: "stretch",
              gap: "1rem 1rem",
              alignItems: "stretch",
              paddingBottom: "2rem",
            }}
          >
            <div>
              <ExtentPicker
                defaultBoundaryExtent={boundaryExtent}
                layer={layer}
                onFilterGeometryChange={(g) => setFilterExtent(g)}
                where={where}
              />
            </div>
            <Divider sx={{ paddingTop: 0 }} />
            <div
              style={{
                display: "flex",
                flexDirection: isLg ? "row" : "column",
                alignSelf: "stretch",
                alignContent: "space-between",
                gap: "1rem 1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  minWidth: "50%",
                  flexGrow: 1,
                }}
              >
                <Typography variant="h3">Attribute Table Preview</Typography>
                <Where defaultWhere={where} onChange={setWhere} />
                <AttributeTablePreview
                  selectedFields={selectedFields}
                  setSelectedFields={setSelectedFields}
                  queryResults={queryResults}
                  fields={layer?.fields ?? []}
                  where={where}
                />
              </div>
              {isLg && <Divider orientation="vertical" flexItem={true} />}
              <div
                style={{
                  flexGrow: 1,
                  minWidth: "48%",
                }}
              >
                <Typography variant="h3">Download Options</Typography>
                <DownloaderForm
                  outFields={selectedFields}
                  queryResults={queryResults}
                  where={where}
                  exportType={exportType}
                  setExportType={setExportType}
                />
              </div>
            </div>
          </div>
        </div>
        <Footer />
        <WelcomeMessage />
      </div>
    </Container>
  );
}

function Footer() {
  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="body2" color="text.secondary" align="center">
        <Link
          color="inherit"
          href="https://github.com/mchaynes/geodatadownloader"
        >
          Github
        </Link>{" "}
      </Typography>
      <a
        href="https://www.buymeacoffee.com/myleschayng"
        target="_blank"
        rel="noreferrer"
        style={{ textAlign: "center", display: "block", marginTop: 20 }}
      >
        <img
          src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
          alt="Buy Me A Coffee"
          style={{
            height: "25px",
            width: "100px",
          }}
        />
      </a>
    </Box>
  );
}
