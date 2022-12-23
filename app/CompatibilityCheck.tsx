import React from "react";
import { StatusAlert } from "./StatusAlert";

export function CompatibilityCheck() {
  const isCompatible = "showSaveFilePicker" in window;
  return (
    <div>
      {!isCompatible && (
        <StatusAlert
          msg="Browser is not compatible. This site relies on the new FileSystem Access API. Please use a supported browser (Chrome, Edge, Opera): https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker#browser_compatibility"
          alertType="error"
        />
      )}
    </div>
  );
}
