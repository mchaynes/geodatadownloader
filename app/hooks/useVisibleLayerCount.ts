import { useState, useEffect } from 'react';

export function useVisibleLayerCount(layers: any[]) {
  const [visibleLayerCount, setVisibleLayerCount] = useState(0);

  useEffect(() => {
    const updateVisibleCount = () => {
      const mapJson = localStorage.getItem("map");
      if (mapJson) {
        const mapConfig = JSON.parse(mapJson);
        const visibleCount = mapConfig.layers.filter((l: any) => l.visible !== false).length;
        setVisibleLayerCount(visibleCount);
      } else {
        setVisibleLayerCount(0);
      }
    };

    // Initial count
    updateVisibleCount();

    // Listen for storage changes (in case other tabs modify it)
    window.addEventListener('storage', updateVisibleCount);

    // Custom event for same-tab updates
    window.addEventListener('layerVisibilityChanged', updateVisibleCount);

    return () => {
      window.removeEventListener('storage', updateVisibleCount);
      window.removeEventListener('layerVisibilityChanged', updateVisibleCount);
    };
  }, [layers]);

  return visibleLayerCount;
}
