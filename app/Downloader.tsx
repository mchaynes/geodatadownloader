import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import { QueryResults } from "./arcgis";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import {
  DEFAULT_CONCURRENT_REQUESTS,
  Downloader,
  GeojsonDownloader,
  MAX_CONCURRENT_REQUESTS,
} from "./formats/geojson";
import { StatusAlert, useStatusAlert } from "./StatusAlert";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import Grid from "@mui/material/Grid";
import MuiInput from "@mui/material/Input";
import Stack from "@mui/material/Stack";
import { CsvDownloader } from "./formats/csv";
import { ShpDownloader } from "./formats/shp";

import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CheckBox from "@mui/icons-material/CheckBox";
import { CircularProgress, Divider, ListItemText } from "@mui/material";
import { Writer } from "./formats/writer";
import { GpkgDownloader } from "./formats/gpkg";

type SupportedExportTypes = "gpkg" | "geojson" | "csv" | "shp";

const Input = styled(MuiInput)`
  width: 42px;
`;

export type DownloaderProps = {
  queryResults: QueryResults;
  outFields: string[];
  where: string;
};

export function DownloaderForm({
  queryResults,
  outFields,
  where,
}: DownloaderProps) {
  const [exportType, setExportType] = useState<SupportedExportTypes>("gpkg");
  const [featuresWritten, setFeaturesWritten] = useState(0);
  const [concRequests, setConcRequests] = useState(DEFAULT_CONCURRENT_REQUESTS);
  const [concAlertProps, setConcAlertProps] = useStatusAlert("", undefined);
  const [totalFeatures, setTotalFeatures] = useState<number>(100);

  const [downloading, setDownloading] = useState(false);
  const [alertProps, setAlertProps] = useStatusAlert("", undefined);

  const MIN = 0;
  const normalise = (value: number) =>
    ((value - MIN) * 100) / (totalFeatures - MIN);

  useEffect(() => {
    async function setTotal() {
      setTotalFeatures(await queryResults.getTotalCount(where));
    }
    void setTotal();
  }, [queryResults, where]);

  useEffect(() => {
    if (concRequests < 1) {
      setConcRequests(1);
    } else if (concRequests > MAX_CONCURRENT_REQUESTS) {
      setConcRequests(MAX_CONCURRENT_REQUESTS);
    }
    if (concRequests > DEFAULT_CONCURRENT_REQUESTS) {
      setConcAlertProps(
        "Careful, setting higher than default concurrency can cause timeouts (it can also speed things up!)",
        "warning"
      );
    } else {
      setConcAlertProps("", undefined);
    }
  }, [concRequests, setConcAlertProps]);

  async function download() {
    let downloader: Downloader;
    switch (exportType) {
      case "geojson": {
        downloader = new GeojsonDownloader(setFeaturesWritten);
        break;
      }
      case "csv": {
        downloader = new CsvDownloader(setFeaturesWritten);
        break;
      }
      case "shp": {
        downloader = new ShpDownloader(setFeaturesWritten);
        break;
      }
      case "gpkg": {
        downloader = new GpkgDownloader(setFeaturesWritten);
        break;
      }
      default:
        throw new Error(`invalid export type: "${exportType}"`);
    }
    const writer = new Writer(
      `${queryResults.getLayer()?.title ?? "Layer"}.${exportType}`
    );
    try {
      setDownloading(true);
      // set the total again here in case it was still loading as we hit download
      setTotalFeatures(await queryResults.getTotalCount(where));
      await downloader.download(
        queryResults,
        writer,
        outFields,
        concRequests,
        where
      );
      setAlertProps(
        `Successfully downloaded ${totalFeatures} features to "${writer.key}"`,
        "success"
      );
    } catch (e) {
      const err = e as Error;
      console.error(err);
      setAlertProps(err.message, "error");
    } finally {
      setDownloading(false);
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConcRequests(event.target.value === "" ? 1 : Number(event.target.value));
  };

  const handleSliderChange = (_: Event, newValue: number) => {
    setConcRequests(newValue);
  };

  return (
    <div>
      <Box sx={{ mt: 3, ml: 1, mr: 1, mb: 1 }}>
        <Stack spacing={2}>
          <FormControl fullWidth={true}>
            <InputLabel>File Type</InputLabel>
            <Select
              labelId="file-type-label"
              id="type-type"
              value={exportType}
              label="Export File Type"
              onChange={(e) => {
                setExportType(e.target.value as SupportedExportTypes);
              }}
            >
              <Divider>Supported Formats</Divider>
              <MenuItem value="geojson">GeoJSON</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="shp">Shapefile (SHP)</MenuItem>
              <MenuItem value="gpkg">Geopackage (GPKG)</MenuItem>
              <Divider>Not yet supported (click thumbs up to vote)</Divider>
              <PotentialExportType format="KML" />
              <PotentialExportType format="Raster formats? (TIFF, etc)" />
            </Select>
          </FormControl>
          <Box>
            <Typography id="input-slider" gutterBottom={true}>
              Concurrent Requests
            </Typography>
            <Grid container={true} spacing={2} alignItems="center">
              <Grid item={true} xs={true}>
                <Slider
                  aria-label="Concurrent Requests"
                  onChange={handleSliderChange}
                  value={concRequests}
                  marks={true}
                  step={1}
                  min={1}
                  max={20}
                />
              </Grid>
              <Grid item={true}>
                <Input
                  id="concurrent-requests-input"
                  value={concRequests}
                  size="small"
                  onChange={handleInputChange}
                  inputProps={{
                    step: 1,
                    min: 1,
                    max: MAX_CONCURRENT_REQUESTS,
                    type: "number",
                    "aria-labelledby": "input-slider",
                  }}
                />
              </Grid>
            </Grid>
          </Box>
          <StatusAlert {...concAlertProps} />
        </Stack>
      </Box>
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" onClick={download}>
          Download
        </Button>
      </Box>
      {downloading && (
        <Box sx={{ mt: 3, ml: 1, mr: 1, mb: 3 }}>
          <LinearProgress
            variant="buffer"
            value={normalise(featuresWritten)}
            valueBuffer={normalise(queryResults.getPageSize())}
          />
          <Typography
            sx={{ display: "flex", justifyContent: "flex-end", m: 2 }}
            variant="h6"
          >
            {featuresWritten} / {totalFeatures}
          </Typography>
        </Box>
      )}
      <Box sx={{ mt: 3, ml: 1, mr: 1, mb: 3 }}>
        <StatusAlert {...alertProps} />
      </Box>
    </div>
  );
}

type PotentialExportTypeProps = {
  format: string;
};

function PotentialExportType({ format }: PotentialExportTypeProps) {
  const [state, setState] = useState("");

  async function onClick() {
    try {
      setState("loading");
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "formats",
          format: format,
        }).toString(),
      });
      if (response.status !== 200) {
        throw new Error(
          `Error from server: ${response.status} - ${await response.text()}`
        );
      }
      setState("success");
    } catch (e) {
      setState("error");
    }
  }

  return (
    <MenuItem value={format} disableRipple={true} disableTouchRipple={true}>
      <ListItemText>{format}</ListItemText>{" "}
      <Button onClick={onClick} disabled={state !== ""}>
        {(function render() {
          switch (state) {
            case "success":
              return <CheckBox color="success" />;
            case "loading":
              return <CircularProgress size={20} />;
            default:
              return <ThumbUpIcon />;
          }
        })()}
      </Button>
    </MenuItem>
  );
}
