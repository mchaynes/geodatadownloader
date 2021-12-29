import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react'
import { QueryResults } from './arcgis'
import { FileHandler } from './FileHandler';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { GeojsonDownloader } from './geojson';
import { StatusAlert } from './StatusAlert';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

type SupportedExportTypes = "geojson"



export type DownloaderProps = {
    queryResults: QueryResults
    outFields: string[]
    fileHandler: FileHandler
}

export function Downloader({ queryResults, fileHandler, outFields }: DownloaderProps) {

    const [exportType, setExportType] = useState<SupportedExportTypes>("geojson")
    const [featuresWritten, setFeaturesWritten] = useState(0)
    const [totalFeatures, setTotalFeatures] = useState<number>(100)

    const [downloading, setDownloading] = useState(false)
    const [successMsg, setSuccessMsg] = useState("")
    const [errMsg, setErrMsg] = useState("")

    const MIN = 0
    const normalise = (value: number) => ((value - MIN) * 100) / (totalFeatures - MIN);

    useEffect(() => {
        async function setTotal() {
            setTotalFeatures(await queryResults.getTotalCount())
        }
        void setTotal()
    }, [queryResults])

    async function download() {
        const fileHandle = await fileHandler.getFileHandle(`${queryResults.getLayer()?.title ?? "Layer"}.geojson`)
        const downloader = new GeojsonDownloader(setFeaturesWritten)
        try {
            setDownloading(true)
            await downloader.download(queryResults, fileHandle, outFields)
            setSuccessMsg(`Successfully downloaded ${totalFeatures} features to "${fileHandle.name}"`)
        } catch (e) {
            const err = e as Error
            setErrMsg(err.message)
        } finally {
            setDownloading(false)
            queryResults.reset()
        }
    }

    return (
        <div>
            <Box sx={{ mt: 3, ml: 1, mr: 1, mb: 1 }}>
                <FormControl fullWidth>
                    <InputLabel>File Type</InputLabel>
                    <Select
                        labelId="file-type-label"
                        id="type-type"
                        value={exportType}
                        label="Export File Type"
                        onChange={(e) => setExportType(e.target.value as SupportedExportTypes)}
                    >
                        <MenuItem value="geojson">GeoJSON</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    onClick={download}
                >
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
                        sx={{ display: 'flex', justifyContent: 'flex-end', m: 2 }}
                        variant="h6"
                    >
                        {featuresWritten} / {totalFeatures}
                    </Typography>
                </Box>

            )}
            <Box sx={{ mt: 3, ml: 1, mr: 1, mb: 3 }}>
                <StatusAlert
                    errorMsg={errMsg}
                    successMsg={successMsg}
                />
            </Box>
        </div>
    )
}