import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import { useCallback, useEffect, useState } from "react";
import * as React from "react";
import type {} from "@mui/x-data-grid/themeAugmentation";
import { StatusAlert, useStatusAlert } from "./StatusAlert";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { setLoadingWhile } from "./loading";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";

export type Status = "not_started" | "loading" | "error" | "loaded";

export type PickLayerProps = {
  defaultLayerUrl: string;
  onLayerLoad: (layer: FeatureLayer) => void;
};

export function PickLayer({ defaultLayerUrl, onLayerLoad }: PickLayerProps) {
  const [loading, setLoading] = useState(false);
  const [alertProps, setAlertProps] = useStatusAlert(
    "Layer options will appear after load",
    "info"
  );
  const [url, setUrl] = useState(defaultLayerUrl);

  const loadLayer = useCallback(
    async (layerUrl: string) => {
      setLoadingWhile(async () => {
        try {
          const layer = new FeatureLayer({
            url: layerUrl,
          });
          await layer.load();
          setAlertProps(
            `Successfully loaded layer "${layer.title}"`,
            "success"
          );
          onLayerLoad(layer);
        } catch (e) {
          const err = e as Error;
          setAlertProps(`${err.message}`, "error");
        }
      }, setLoading);
    },
    [onLayerLoad, setAlertProps, setLoading]
  );

  useEffect(() => {
    if (defaultLayerUrl) {
      void loadLayer(defaultLayerUrl);
    }
  }, [defaultLayerUrl, loadLayer]);

  function onLoadClick() {
    void loadLayer(url);
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onLoadClick();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem 1rem",
        marginTop: "1rem",
      }}
    >
      <Typography variant="h2">Layer Url</Typography>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          gap: "1rem 1rem",
        }}
      >
        <TextField
          id="layer-url"
          required
          autoComplete="url"
          fullWidth
          variant="outlined"
          placeholder="https://gismaps.kingcounty.gov/arcgis/rest/services/Environment/KingCo_SensitiveAreas/MapServer/11"
          value={url}
          onChange={(e) => setUrl(e.currentTarget.value)}
          onKeyPress={handleKeyPress}
        />
        <Button id="load-layer" variant="contained" onClick={onLoadClick}>
          Load
        </Button>
      </div>
      <Box>
        <StatusAlert loading={loading} {...alertProps} />
      </Box>
    </div>
  );
}
