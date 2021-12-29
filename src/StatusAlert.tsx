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
    successMsg?: string
    /**
     * Error message to display if errored
     */
    errorMsg?: string
    /**
     * Info message to display if not loading/successful/errored
     */
    infoMsg?: string
}

/**
 * Renders different indicators based on status, in the following precedence:
 * 1. Loading (if true)
 * 2. Error (if non-empty string)
 * 3. Success (if non-empty string)
 * 4. Info (if non-empty string)
 * 5. Nothing (if nothing defined. Helpful for only displaying status when necessary)
 */
export function StatusAlert({ loading, successMsg, errorMsg, infoMsg }: StatusAlertProps) {
    if (loading) {
        return (
            <LinearProgress />
        )
    }
    if (errorMsg) {
        return (
            <Alert severity="info">
                {errorMsg}
            </Alert>
        )
    }
    if (successMsg) {
        return (
            <Alert severity="success">
                {successMsg}
            </Alert>
        )
    }
    if (infoMsg) {
        return (
            <Alert severity="info">
                {infoMsg}
            </Alert>
        )
    }
    return (<></>)
}