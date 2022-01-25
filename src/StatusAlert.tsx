import React, { useState } from 'react'
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

export type AlertType = "error" | "success" | "info" | "warning" | undefined

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

export type StatusAlertSetter = (msg: string, alertType: AlertType) => void;

export function useStatusAlert(msg: string, alertType: AlertType): [StatusAlertProps, StatusAlertSetter] {
    const [msgState, setMsgState] = useState(msg)
    const [alertTypeState, setAlertTypeState] = useState(alertType)
    const setStatusAlert = (newMsg: string, newAlertType: AlertType) => {
        setMsgState(newMsg)
        setAlertTypeState(newAlertType)
    }
    return [{
        msg: msgState,
        alertType: alertTypeState,
    }, setStatusAlert]
}