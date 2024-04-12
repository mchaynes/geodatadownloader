import { ThemeProvider } from "@emotion/react";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import {
  createTheme,
  CssBaseline,
  responsiveFontSizes,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { green, cyan } from "@mui/material/colors";
import logo from "/IMG_1039.png";
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
import ShareUrlButton from "./ShareUrlButton";
import React from "react";
import { ColorModeContext } from "./context";


function App() {
  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));

  const queryParam = useMemo(() => getQueryParameter("format"), []);
  const [exportType, setExportType] = useState(
    queryParam ?? "GPKG"
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
        borderLeft: "20rem",
        borderRight: "10rem",
        paddingTop: "1rem",
        paddingBottom: "2rem",
      }}
    >
      <CssBaseline />
      <div style={{ display: "flex", flexDirection: "row" }}>
        <img src={logo as string} width="36px" height="36px" alt="Pine" />
        <Typography sx={{ ml: 3 }} variant="h1" color="inherit" noWrap={true}>
          geodatadownloader
        </Typography>
        <ShareUrlButton
          params={{
            where: where,
            boundary: filterExtent ? JSON.stringify(filterExtent.toJSON()) : "",
            layer_url: layer ? `${layer.url}/${layer.layerId}` : layerUrl,
            format: exportType,
          }}
        />
      </div>
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
              flexDirection: isLg ? "row" : "column",
              flexWrap: "wrap",
              gap: "1rem",
              alignItems: "stretch",
            }}
          >
            <div style={{ flexGrow: 4 }}>
              <ExtentPicker
                defaultBoundaryExtent={boundaryExtent}
                layer={layer}
                onFilterGeometryChange={(g) => setFilterExtent(g)}
                where={where}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignContent: "space-between",
                gap: "1rem 1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                }}
              >
                <Where defaultWhere={where} onChange={setWhere} />
                <AttributeTablePreview
                  selectedFields={selectedFields}
                  setSelectedFields={setSelectedFields}
                  queryResults={queryResults}
                  fields={layer?.fields ?? []}
                  where={where}
                />
              </div>
            </div>
            <div
              style={{
                flexGrow: 1,
                minWidth: "48%",
              }}
            >
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

export default function WithStyles() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = React.useState<"light" | "dark">("light");

  const colorMode = useMemo(
    () => ({
      mode: mode,
      setColorMode: (colorMode: typeof mode) => {
        setMode(colorMode);
      },
    }),
    [mode]
  );
  useEffect(() => {
    colorMode.setColorMode(prefersDarkMode ? "dark" : "light");
  }, [prefersDarkMode, mode]);

  const theme = React.useMemo(() => {
    return responsiveFontSizes(
      createTheme({
        palette: {
          mode: mode,
          ...(mode === "light"
            ? {
              primary: {
                main: cyan.A700,
              },
              success: {
                light: green.A700,
                main: green.A700,
                dark: green[900],
              },
            }
            : {
              primary: {
                main: cyan.A400,
              },
              success: {
                light: green.A700,
                main: green.A700,
                dark: green[900],
              },
            }),
        },
        typography: {
          fontFamily: [
            "Roboto",
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            '"Helvetica Neue"',
            "Arial",
            "sans-serif",
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
          ].join(" "),
          fontWeightRegular: 300,
          fontWeightLight: 200,
          fontWeightMedium: 350,
          fontWeightBold: 400,
          fontSize: 14,
          h1: {
            fontSize: "1.5rem",
            flexGrow: 1,
          },
          h2: {
            alignSelf: "flex-start",
            fontSize: "2rem",
            fontWeight: 400,
            marginBottom: "1rem",
          },
          h3: {
            fontSize: "1.25rem",
            marginBottom: "0.75rem",
          },
          body1: {
            fontSize: "1.0rem",
          },
          body2: {
            fontSize: "0.9rem",
          },
          caption: {
            fontSize: "0.7rem",
            paddingTop: "0.5rem",
            paddingBottom: "0.5rem",
            paddingRight: "1rem",
            display: "flex",
            justifyContent: "flex-end",
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                fontWeight: 900,
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              sizeSmall: {
                fontSize: "0.8rem",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              outlined: {
                display: "flex",
                flexDirection: "column",
                gap: "1rem 1rem",
                alignItems: "stretch",
                paddingTop: "1rem",
                paddingLeft: "3rem",
                paddingRight: "3rem",
                paddingBottom: "1rem",
              },
            },
          },
          MuiAlert: {
            styleOverrides: {
              standardSuccess: {
                justifySelf: "flex-end",
                fontWeight: 600,
              },
              standardInfo: {
                justifySelf: "flex-end",
                fontWeight: 600,
              },
            },
          },
          MuiDivider: {
            styleOverrides: {
              root: {
                paddingTop: "2rem",
                paddingBottom: "1rem",
              },
            },
          },
          MuiContainer: {
            styleOverrides: {
              root: {
                display: "flex",
                flexDirection: "row",
                gap: ".5rem .5rem",
              },
            },
          },
        },
      })
    );
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <ColorModeContext.Provider value={colorMode}>
        <App />
      </ColorModeContext.Provider>
    </ThemeProvider>
  );
}
