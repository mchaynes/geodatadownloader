import { useCallback, useState } from "react";
import Alert, { AlertProps } from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import { SxProps, Theme, Typography } from "@mui/material";

export interface StatusAlertProps extends AlertProps {
  /**
   * Whether currently loading or not
   */
  loading?: boolean;
  /**
   * Success message to display if successful
   */
  msg?: JSX.Element | string;

  /** Optional detailed text shown when user clicks "Show details" */
  details?: string;

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
  details,
}: StatusAlertProps) {
  if (loading) {
    return <LinearProgress />;
  }
  if (alertType) {
    return (
      <Alert onClose={onClose} severity={alertType}>
        <div>
          {msg}
          {details && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: "pointer" }}>Show details</summary>
              <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{details}</pre>
            </details>
          )}
        </div>
      </Alert>
    );
  }
  return <></>;
}

export type StatusAlertSetter = (
  msg: JSX.Element | string,
  alertType: AlertType,
  details?: string
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
    (newMsg: string, newAlertType: AlertType, details?: string) => {
      setProps({
        msg: <Typography sx={{ wordWrap: "break-word" }}>{newMsg}</Typography>,
        alertType: newAlertType,
        details,
      });
    },
    []
  );
  return [props, setStatusAlert];
};
