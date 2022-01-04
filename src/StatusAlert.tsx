import React from 'react'
import Alert from '@mui/material/Alert'
import LinearProgress from '@mui/material/LinearProgress'

export type StatusAlertProps = {
    /**
     * Whether currently loading or not
     */
    loading?: boolean
    /**
     * Success message to display if successful
     */
    success?: JSX.Element | string
    /**
     * Error message to display if errored
     */
    error?: JSX.Element | string
    /**
     * Info message to display if not loading/successful/errored
     */
    info?: JSX.Element | string
}

/**
 * Renders different indicators based on status, in the following precedence:
 * 1. Loading (if true)
 * 2. Error (if non-empty string)
 * 3. Success (if non-empty string)
 * 4. Info (if non-empty string)
 * 5. Nothing (if nothing defined. Helpful for only displaying status when necessary)
 */
export function StatusAlert({ loading, success, error, info }: StatusAlertProps) {
    if (loading) {
        return (
            <LinearProgress />
        )
    }
    if (error) {
        return (
            <Alert severity="error">
                {error}
            </Alert>
        )
    }
    if (success) {
        return (
            <Alert severity="success">
                {success}
            </Alert>
        )
    }
    if (info) {
        return (
            <Alert severity="info">
                {info}
            </Alert>
        )
    }
    return (<></>)
}