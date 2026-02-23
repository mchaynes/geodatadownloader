import { useState, useCallback } from 'react';
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

type BrokenLayer = { url: string; name?: string; reason: string };

export function useBrokenLayers(initialBrokenLayers: BrokenLayer[] = []) {
  const [showBrokenModal, setShowBrokenModal] = useState(initialBrokenLayers.length > 0);
  const [broken, setBroken] = useState<BrokenLayer[]>(initialBrokenLayers);
  const [retryingBrokenCheck, setRetryingBrokenCheck] = useState(false);

  const handleRetryBrokenCheck = useCallback(async () => {
    if (!broken?.length) {
      setShowBrokenModal(false);
      return;
    }
    setRetryingBrokenCheck(true);
    try {
      const checks = await Promise.allSettled(
        broken.map(b => {
          const lyr = new FeatureLayer({ url: b.url });
          return lyr.load();
        })
      );
      const stillBroken: BrokenLayer[] = [];
      checks.forEach((res, idx) => {
        if (res.status === "rejected") {
          const err = res.reason as Error;
          const prev = broken[idx];
          stillBroken.push({ ...prev, reason: err?.message ?? prev.reason });
        }
      });
      setBroken(stillBroken);
      if (stillBroken.length === 0) {
        setShowBrokenModal(false);
      }
    } finally {
      setRetryingBrokenCheck(false);
    }
  }, [broken]);

  return {
    showBrokenModal,
    setShowBrokenModal,
    broken,
    retryingBrokenCheck,
    handleRetryBrokenCheck,
  };
}
