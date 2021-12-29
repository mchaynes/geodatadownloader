import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import React, { useState } from 'react'
import type { } from '@mui/x-data-grid/themeAugmentation';
import { StatusAlert } from './StatusAlert';

export type Status = "not_started" | "loading" | "error" | "loaded"


export type PickLayerProps = {
    onSuccess: () => void
    loadLayer: (layerUrl: string) => Promise<string>
}

export function PickLayer({ onSuccess, loadLayer }: PickLayerProps) {

    const [loading, setLoading] = useState(false)
    const [successMsg, setSuccessMsg] = useState("")
    const [errMsg, setErrMsg] = useState("")
    const [url, setUrl] = useState("")

    async function onLoadClick() {
        try {
            setLoading(true)
            const title = await loadLayer(url)
            setSuccessMsg(`Successfully loaded layer "${title}"`)
            onSuccess()
        } catch (e) {
            console.error(e)
            setErrMsg(`${e}`)
            setSuccessMsg("")
        } finally {
            setLoading(false)
        }
    }

    return (
        <React.Fragment>
            <TextField
                required
                fullWidth sx={{ m: 1 }}
                variant="outlined"
                label="Layer Url"
                value={url}
                onChange={(e) => setUrl(e.currentTarget.value)}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    sx={{ mt: 3, ml: 1 }}
                    onClick={() => onLoadClick()}
                >
                    Load
                </Button>
            </Box>
            <Box sx={{ ml: 1, mt: 2 }}>
                <StatusAlert
                    loading={loading}
                    successMsg={successMsg}
                    errorMsg={errMsg}
                    infoMsg="Layer options will appear after load"
                />
            </Box>

        </React.Fragment >
    )
}