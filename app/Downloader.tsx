import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiButton from "@mui/material/Button";
import { useEffect, useState } from "react";
import { QueryResults } from "./arcgis";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import {
  DEFAULT_CONCURRENT_REQUESTS,
  MAX_CONCURRENT_REQUESTS,
} from "./formats/geojson";
import { StatusAlert, useStatusAlert } from "./StatusAlert";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import LinearProgress from "@mui/material/LinearProgress";
import Slider from "@mui/material/Slider";
import Grid from "@mui/material/Grid";
import MuiInput from "@mui/material/Input";
import Stack from "@mui/material/Stack";

import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CheckBox from "@mui/icons-material/CheckBox";
import { CircularProgress, ListItemText } from "@mui/material";
import { Writer } from "./formats/writer";
import { Drivers, GdalDownloader } from "./formats/gdal";


const Input = styled(MuiInput)`
  width: 42px;
`;

export type DownloaderProps = {
  queryResults?: QueryResults;
  outFields: string[];
  where: string;
  exportType: string;
  setExportType: (exportType: string) => void;
};

export function DownloaderForm({
  queryResults,
  outFields,
  where,
  exportType,
  setExportType,
}: DownloaderProps) {
  const [featuresWritten, setFeaturesWritten] = useState(0);
  const [concRequests, setConcRequests] = useState(DEFAULT_CONCURRENT_REQUESTS);
  const [concAlertProps, setConcAlertProps] = useStatusAlert("", undefined);
  const [totalFeatures, setTotalFeatures] = useState<number>(100);

  const [downloading, setDownloading] = useState(false);
  const [alertProps, setAlertProps] = useStatusAlert("", undefined);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsText, setDetailsText] = useState<string | undefined>(undefined);
  const [prettyMsg, setPrettyMsg] = useState<string | undefined>(undefined);

  const MIN = 0;
  const normalise = (value: number) =>
    ((value - MIN) * 100) / (totalFeatures - MIN);

  useEffect(() => {
    async function setTotal() {
      if (!queryResults) {
        return;
      }
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
    if (!queryResults) {
      return;
    }

    const downloader = new GdalDownloader(setFeaturesWritten)
    const writer = new Writer();
    try {
      setDownloading(true);
      // set the total again here in case it was still loading as we hit download
      setTotalFeatures(await queryResults.getTotalCount(where));
      await downloader.download(
        queryResults,
        writer,
        outFields,
        concRequests,
        where,
        exportType
      );
      setAlertProps(`Successfully downloaded ${totalFeatures} features`, "success");
    } catch (e) {
      const err = e as Error;
      console.error(err);
      const msg = err.message ?? "An unknown error occurred while downloading.";

      const compact = (
        <span>
          Download failed.{' '}
          <Link component="button" underline="always" onClick={() => setDetailsOpen(true)}>
            See why
          </Link>
        </span>
      );

      if (msg.includes("No output files were generated")) {
        setPrettyMsg(
          "No files were generated for this download. This may mean the ArcGIS server returned an error, or no features matched your query. Check the layer URL and try again."
        );
      } else if (msg.includes("ArcGIS server error")) {
        const parts = msg.split(":");
        const serverMsg = parts.slice(1).join(":").trim() || msg;
        setPrettyMsg(`Server error when fetching layer: ${serverMsg}. Try again later or check the layer's service URL.`);
      } else {
        setPrettyMsg(msg);
      }
      setDetailsText(err.message);
      setAlertProps(compact, "error", undefined);
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        flexGrow: 1,
        gap: "2rem 2rem",
      }}
    >
      <Box>
        <Stack spacing={2}>
          <FormControl fullWidth={true}>
            <InputLabel>File Type</InputLabel>
            <Select
              labelId="file-type-label"
              id="type-type"
              value={exportType}
              label="Export File Type"
              onChange={(e) => {
                setExportType(e.target.value);
              }}
            >
              {Object.keys(Drivers).map(t => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
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
        </Stack>
      </Box>
      <MuiButton
        disabled={!queryResults}
        variant="contained"
        sx={{ alignSelf: "flex-end" }}
        onClick={() => void download()}
      >
        Download
      </MuiButton>

      <StatusAlert {...concAlertProps} />
      {downloading && (
        <Box sx={{ mt: 3, ml: 1, mr: 1, mb: 3 }}>
          <LinearProgress
            variant="buffer"
            value={normalise(featuresWritten)}
            valueBuffer={normalise(queryResults?.getPageSize() ?? 0)}
          />
          <Typography
            sx={{ display: "flex", justifyContent: "flex-end", m: 2 }}
            variant="h6"
          >
            {featuresWritten} / {totalFeatures}
          </Typography>
        </Box>
      )}
      <StatusAlert {...alertProps} />

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        fullWidth={true}
        maxWidth="lg"
        aria-labelledby="download-error-dialog"
      >
        <DialogTitle id="download-error-dialog">Download failed</DialogTitle>
        <DialogContent dividers>
          <Typography paragraph sx={{ wordWrap: 'break-word' }}>
            {prettyMsg}
          </Typography>
          <Typography component="div" sx={{ mt: 2 }}>
            <strong>Technical details</strong>
            <div style={{ marginTop: 8 }}>
              <pre style={{ overflowX: 'auto', whiteSpace: 'pre', background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                {detailsText}
              </pre>
            </div>
          </Typography>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setDetailsOpen(false)}>Close</MuiButton>
        </DialogActions>
      </Dialog>
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
      <MuiButton onClick={() => void onClick()} disabled={state !== ""}>
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
      </MuiButton>
    </MenuItem>
  );
}

