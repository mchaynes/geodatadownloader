import { createContext, useContext } from "react";
import MapView from "@arcgis/core/views/MapView";

// Create a context for MapView with undefined as default
export const MapViewContext = createContext<MapView | undefined>(undefined);

// Hook to use MapView from context
export function useMapView() {
  return useContext(MapViewContext);
}
