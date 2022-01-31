import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import React, { useState } from 'react'
import type { } from '@mui/x-data-grid/themeAugmentation';
import { StatusAlert, useStatusAlert } from './StatusAlert';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { setLoadingWhile } from './loading';

export type Status = "not_started" | "loading" | "error" | "loaded"


export type PickLayerProps = {
    onLayerLoad: (layer: FeatureLayer) => void
}

export function PickLayer({ onLayerLoad }: PickLayerProps) {

    const [loading, setLoading] = useState(false)
    const [alertProps, setAlertProps] = useStatusAlert("Layer options will appear after load", "info")
    const [url, setUrl] = useState("")

    function onLoadClick() {
        setLoadingWhile(async () => {
            try {
                const layer = new FeatureLayer({
                    url: url,
                })
                await layer.load()
                setAlertProps(`Successfully loaded layer "${layer.title}"`, "success")
                onLayerLoad(layer)
            } catch (e) {
                const err = e as Error
                setAlertProps(`${err.message}`, "error")
            }
        }, setLoading)
    }

    return (
        <React.Fragment>
            <TextField
                id="layer-url"
                required
                autoComplete='url'
                fullWidth sx={{ m: 1 }}
                variant="outlined"
                label="Layer Url"
                value={url}
                onChange={(e) => setUrl(e.currentTarget.value)}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    id="load-layer"
                    variant="contained"
                    sx={{ mt: 3, ml: 1 }}
                    onClick={onLoadClick}
                >
                    Load
                </Button>
            </Box>
            <Box sx={{ ml: 1, mt: 2 }}>
                <StatusAlert
                    loading={loading}
                    {...alertProps}
                />
            </Box>

        </React.Fragment >
    )
}