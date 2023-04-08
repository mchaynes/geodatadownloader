import { ThemeProvider } from "@emotion/react";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import { Button, createTheme, Divider, IconButton, Paper } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import logo from "./icons/icon-128.png";
import { WelcomeMessage } from "./WelcomeMessage";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { getQueryParameter, setQueryParameter } from "./url";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { useEffect, useState } from "react";
import { PickLayer } from "./PickLayer";
import { QueryResults } from "./arcgis";
import Geometry from "@arcgis/core/geometry/Geometry";
import { Where } from "./Where";
import { AttributeTablePreview } from "./AttributeTablePreview";
import { ExtentPicker } from "./ExtentPicker";
import { DownloaderForm } from "./Downloader";
import { Share } from "@mui/icons-material";

const theme = createTheme();

const paperSx = { my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } };

const defaultLayerUrl =
  "https://gismaps.kingcounty.gov/arcgis/rest/services/Environment/KingCo_SensitiveAreas/MapServer/11";

type SupportedExportTypes = "gpkg" | "geojson" | "csv" | "shp";

function App() {
  const [exportType, setExportType] = useState(
    getQueryParameter("format") ?? "gpkg"
  );
  const layerUrl = getQueryParameter("layer_url") || defaultLayerUrl;
  const [layer, setLayer] = useState<FeatureLayer>(
    new FeatureLayer({
      url: layerUrl,
    })
  );
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filterExtent, setFilterExtent] = useState<Geometry | undefined>(
    undefined
  );
  const [where, setWhere] = useState(() => getQueryParameter("where") || "1=1");
  const [queryResults, setQueryResults] = useState<QueryResults | undefined>();
  const boundaryExtent = getQueryParameter("boundary") ?? "";

  useEffect(() => {
    if (layer.loaded) {
      setSelectedFields(layer.fields.map((f) => f.name));
      setQueryResults(new QueryResults(layer, filterExtent));
    }
  }, [layer]);

  useEffect(() => {
    setQueryResults(new QueryResults(layer, filterExtent, 500));
  }, [filterExtent, layer]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar
        position="absolute"
        color="default"
        elevation={0}
        sx={{
          position: "relative",
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Toolbar>
          <img src={logo as string} width="32px" height="32px" alt="Pine" />
          <Typography
            sx={{ flexGrow: 1, ml: 3 }}
            variant="h6"
            color="inherit"
            noWrap={true}
          >
            geodatadownloader
          </Typography>
          <IconButton
            title="Create shareable URL. You can use this to automatically fill out all fields by just sharing the URL"
            sx={{ justifyContent: "flex-end" }}
            onClick={() => {
              setQueryParameter({
                where: where,
                boundary: JSON.stringify(filterExtent?.toJSON()),
                layer_url: layerUrl,
                format: exportType,
              });
            }}
          >
            <Share></Share>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="lg" sx={{ mb: 4 }}>
        <Box>
          <Paper variant="outlined" sx={paperSx}>
            <SectionHeader header="Layer Info" />
            <PickLayer defaultLayerUrl={layerUrl} onLayerLoad={setLayer} />
            {layer.loaded && queryResults && (
              <div>
                <SectionDivider />
                <SectionHeader header="Draw Boundary (if you want)" />
                <ExtentPicker
                  defaultBoundaryExtent={boundaryExtent}
                  layer={layer}
                  onFilterGeometryChange={(g) => setFilterExtent(g)}
                  where={where}
                />

                <SectionDivider />
                <SectionHeader header="Attribute Table Preview" />
                <Where defaultWhere={where} onChange={setWhere} />
                <AttributeTablePreview
                  selectedFields={selectedFields}
                  setSelectedFields={setSelectedFields}
                  queryResults={queryResults}
                  fields={layer.fields}
                  where={where}
                />
                <SectionDivider />
                <SectionHeader header="Download Options" />
                <DownloaderForm
                  outFields={selectedFields}
                  queryResults={queryResults}
                  where={where}
                  exportType={exportType}
                  setExportType={setExportType}
                />
              </div>
            )}
          </Paper>
        </Box>
        <Footer />
        <WelcomeMessage />
      </Container>
    </ThemeProvider>
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

export type WorkflowItemsProps = {
  layer: FeatureLayer;
};

export function WorkflowItems({ layer }: WorkflowItemsProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>(
    layer.fields.map((f) => f.name)
  );
  const [filterExtent, setFilterExtent] = useState<Geometry | undefined>(
    undefined
  );
  const [where, setWhere] = useState(() => getQueryParameter("where") || "1=1");
  const [queryResults, setQueryResults] = useState<QueryResults>(() => {
    return new QueryResults(layer, filterExtent);
  });
  const boundaryExtent = getQueryParameter("boundary") ?? "";

  useEffect(() => {
    setQueryResults(new QueryResults(layer, filterExtent, 500));
  }, [filterExtent, layer]);

  return (
    <div>
      <SectionDivider />
      <SectionHeader header="Draw Boundary (if you want)" />
      <ExtentPicker
        defaultBoundaryExtent={boundaryExtent}
        layer={layer}
        onFilterGeometryChange={(g) => setFilterExtent(g)}
        where={where}
      />

      <SectionDivider />
      <SectionHeader header="Attribute Table Preview" />
      <Where defaultWhere={where} onChange={setWhere} />
      <AttributeTablePreview
        selectedFields={selectedFields}
        setSelectedFields={setSelectedFields}
        queryResults={queryResults}
        fields={layer.fields}
        where={where}
      />
      <SectionDivider />
      <SectionHeader header="Download Options" />
      <DownloaderForm
        outFields={selectedFields}
        queryResults={queryResults}
        where={where}
      />
    </div>
  );
}

type SectionHeaderProps = {
  header: string;
};

function SectionHeader({ header }: SectionHeaderProps) {
  return (
    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
      {header}
    </Typography>
  );
}

function SectionDivider() {
  return <Divider sx={{ mt: 3, mb: 3 }}></Divider>;
}

export default App;
