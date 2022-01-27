import React, { useCallback, useState } from 'react'
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

export const useStatusAlert = (msg: string, alertType: AlertType): [StatusAlertProps, StatusAlertSetter] => {
    const [props, setProps] = useState<StatusAlertProps>(() => ({
        msg: msg,
        alertType: alertType,
    }))
    // Wrap function in useCallback with no deps because this function should always be the same object
    // this mimics the guarantee set by useState()
    const setStatusAlert = useCallback((newMsg: string, newAlertType: AlertType) => {
        setProps({
            msg: newMsg,
            alertType: newAlertType
        })
    }, [])
    return [props, setStatusAlert]
}