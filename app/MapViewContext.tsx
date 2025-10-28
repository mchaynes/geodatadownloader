import { createContext, useContext, useState, ReactNode } from "react";
import MapView from "@arcgis/core/views/MapView";

type MapViewContextType = {
  mapView: MapView | undefined;
  setMapView: (mapView: MapView | undefined) => void;
};

// Create a context for MapView with undefined as default
export const MapViewContext = createContext<MapViewContextType>({
  mapView: undefined,
  setMapView: () => {},
});

// Hook to use MapView from context
export function useMapView() {
  const context = useContext(MapViewContext);
  return context.mapView;
}

// Hook to use the full context (including setter)
export function useMapViewContext() {
  return useContext(MapViewContext);
}

// Provider component
export function MapViewProvider({ children }: { children: ReactNode }) {
  const [mapView, setMapView] = useState<MapView | undefined>(undefined);
  
  return (
    <MapViewContext.Provider value={{ mapView, setMapView }}>
      {children}
    </MapViewContext.Provider>
  );
}
