import { useCallback, useEffect, useState } from "react";
import Alert, { AlertProps } from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import { SxProps, Theme } from "@mui/material";

export interface StatusAlertProps extends AlertProps {
    /**
     * Whether currently loading or not
     */
    loading?: boolean;
    /**
     * Success message to display if successful
     */
    msg?: JSX.Element | string;

    alertType?: AlertType;

    onClose?: () => void;

    sx?: SxProps<Theme>;
}

export type AlertType = "error" | "success" | "info" | "warning" | undefined;

/**
 * Renders different indicators based on status.
 * 1. Loading (if true)
 * 2. Alert based on alertType
 * 3. Nothing, if alertType not defined
 */
export function StatusAlert({
    loading,
    msg,
    alertType,
    onClose,
    sx,
}: StatusAlertProps) {
    if (loading) {
        return <LinearProgress />;
    }
    if (alertType) {
        return (
            <Alert onClose={onClose} severity={alertType} sx={sx}>
                {msg}
            </Alert>
        );
    }
    return <></>;
}

export type StatusAlertSetter = (
    msg: JSX.Element | string,
    alertType: AlertType
) => void;

export const useStatusAlert = (
    msg: string,
    alertType: AlertType
): [StatusAlertProps, StatusAlertSetter] => {
    const [props, setProps] = useState<StatusAlertProps>(() => ({
        msg: msg,
        alertType: alertType,
    }));
    // Wrap function in useCallback with no deps because this function should always be the same object
    // this mimics the guarantee set by useState()
    const setStatusAlert = useCallback(
        (newMsg: string, newAlertType: AlertType) => {
            setProps({
                msg: newMsg,
                alertType: newAlertType,
            });
        },
        []
    );
    return [props, setStatusAlert];
};
