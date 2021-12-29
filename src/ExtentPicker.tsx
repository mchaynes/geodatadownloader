import Box from '@mui/material/Box'
import { useEffect, useRef, useState } from 'react'
import { setLoadingWhile } from './loading'
import { CircularProgress } from '@mui/material'

export type ExtentPickerProps = {
    attachMap?: (container: any) => Promise<void>
}

export function ExtentPicker({ attachMap }: ExtentPickerProps) {
    const elRef = useRef(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function attachView() {
            setLoadingWhile(async () => {
                if (attachMap) {
                    await import("./arcgis")
                    await attachMap(elRef.current)
                }
            }, setLoading)
        }
        void attachView()
    }, [attachMap])

    return (
        <Box sx={{ ml: 1, mt: 1 }}>
            {loading && (
                <CircularProgress />
            )}
            <div ref={elRef} style={{ height: 400, width: '100%' }} />
        </Box>
    )
}