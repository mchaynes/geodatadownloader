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
    msg?: JSX.Element | string

    alertType?: AlertType
}

export type AlertType = "error" | "success" | "info" | undefined

/**
 * Renders different indicators based on status.
 * 1. Loading (if true)
 * 2. Alert based on alertType
 * 3. Nothing, if alertType not defined
 */
export function StatusAlert({ loading, msg, alertType }: StatusAlertProps) {
    if (loading) {
        return (
            <LinearProgress />
        )
    }
    if (alertType) {
        return (
            <Alert severity={alertType}>
                {msg}
            </Alert>
        )
    }
    return (<></>)
}