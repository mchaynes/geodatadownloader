import { StatusAlert } from "./StatusAlert"


export default function CompatibilityCheck() {
    const isCompatible = "showSaveFilePicker" in window
    return (
        <div>
            {!isCompatible && (
                <StatusAlert
                    errorMsg="Browser is not compatible. This site relies on the new FileSystem Access API. Please use a supported browser (Chrome, Edge, Opera): https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker#browser_compatibility"
                />
            )}
        </div>
    )
}