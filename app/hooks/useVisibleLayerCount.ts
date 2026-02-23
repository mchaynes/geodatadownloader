import { useState, useEffect } from 'react';
import { getMapConfigSync } from '../database';

export function useVisibleLayerCount(layers: any[]) {
  const [visibleLayerCount, setVisibleLayerCount] = useState(0);

  useEffect(() => {
    const updateVisibleCount = () => {
      const mapConfig = getMapConfigSync();
      const visibleCount = mapConfig.layers.filter((l: any) => l.visible !== false).length;
      setVisibleLayerCount(visibleCount);
    };

    updateVisibleCount();

    window.addEventListener('layerVisibilityChanged', updateVisibleCount);

    return () => {
      window.removeEventListener('layerVisibilityChanged', updateVisibleCount);
    };
  }, [layers]);

  return visibleLayerCount;
}
