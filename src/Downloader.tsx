import React from "react";
import InputLabel from "@mui/material/InputLabel";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import { QueryResults } from "./arcgis";
import { FileHandler } from "./FileHandler";
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

type SupportedExportTypes = "geojson" | "csv";

const Input = styled(MuiInput)`
  width: 42px;
`;

export type DownloaderProps = {
	queryResults: QueryResults;
	outFields: string[];
	fileHandler: FileHandler;
	where: string;
};

export function Downloader({
	queryResults,
	fileHandler,
	outFields,
	where,
}: DownloaderProps) {
	const [exportType, setExportType] = useState<SupportedExportTypes>("geojson");
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
				"warning",
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
			default:
				throw new Error(`invalid export type: "${exportType}"`);
		}
		const fileHandle = await fileHandler.getFileHandle(
			`${queryResults.getLayer()?.title ?? "Layer"}.${exportType}`,
		);
		try {
			setDownloading(true);
			// set the total again here in case it was still loading as we hit download
			setTotalFeatures(await queryResults.getTotalCount(where));
			await downloader.download(
				queryResults,
				fileHandle,
				outFields,
				concRequests,
				where,
			);
			setAlertProps(
				`Successfully downloaded ${totalFeatures} features to "${fileHandle.name}"`,
				"success",
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
							onChange={(e) =>
								setExportType(e.target.value as SupportedExportTypes)
							}
						>
							<MenuItem value="geojson">GeoJSON</MenuItem>
							<MenuItem value="csv">CSV</MenuItem>
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
