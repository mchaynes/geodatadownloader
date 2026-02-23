import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GdalDownloader } from "../../downloader";
import { QueryResult, queryLayer, parseGeometryFromString } from "../../arcgis";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { Progress, Alert } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import Geometry from "@arcgis/core/geometry/Geometry";

type DownloadPhase = "idle" | "querying-ids" | "fetching-features" | "converting" | "zipping" | "complete" | "error";

interface DownloadProgress {
  phase: DownloadPhase;
  totalObjectIds?: number;
  fetchedFeatures: number;
  totalFeatures: number;
  currentPage: number;
  totalPages: number;
  message: string;
}

// Progress percentages for each phase
const PHASE_PROGRESS = {
  idle: 0,
  "querying-ids": 10,
  "fetching-features": { start: 20, end: 80 },
  converting: 85,
  zipping: 95,
  complete: 100,
  error: 0,
} as const;

export default function DownloadPage() {
  const [searchParams] = useSearchParams();
  
  const [progress, setProgress] = useState<DownloadProgress>({
    phase: "idle",
    fetchedFeatures: 0,
    totalFeatures: 0,
    currentPage: 0,
    totalPages: 0,
    message: "Initializing download...",
  });
  
  const [error, setError] = useState<string | undefined>(undefined);
  const [errorDetails, setErrorDetails] = useState<string | undefined>(undefined);

  useEffect(() => {
    const startDownload = async () => {
      try {
        // Get parameters from URL
        const format = searchParams.get("format") || "GPKG";
        const concurrent = parseInt(searchParams.get("concurrent") || "1", 10);
        const minZoom = parseInt(searchParams.get("minZoom") || "0", 10);
        const maxZoom = parseInt(searchParams.get("maxZoom") || "14", 10);
        const layersJson = searchParams.get("layers");
        const boundaryJson = searchParams.get("boundary");

        if (!layersJson) {
          throw new Error("No layers specified for download");
        }

        let layerConfigs: Array<{
          url: string;
          where?: string;
          columnMapping?: Record<string, string>;
        }>;

        try {
          layerConfigs = JSON.parse(layersJson);
        } catch (parseError) {
          throw new Error("Invalid layer configuration: malformed JSON");
        }

        // Parse boundary geometry if provided
        let filterGeometry: Geometry | undefined;
        if (boundaryJson) {
          try {
            filterGeometry = parseGeometryFromString(boundaryJson);
          } catch (parseError) {
            console.warn("Failed to parse boundary geometry, proceeding without spatial filter:", parseError);
          }
        }

        // Phase 1: Load layers and query for ObjectIDs
        setProgress(prev => ({
          ...prev,
          phase: "querying-ids",
          message: filterGeometry
            ? "Loading layers and querying for ObjectIDs (with spatial filter)..."
            : "Loading layers and querying for ObjectIDs...",
        }));

        const layers: FeatureLayer[] = [];
        for (const config of layerConfigs) {
          const layer = new FeatureLayer({ url: config.url });
          await layer.load();
          layers.push(layer);
        }

        // Create query results with enhanced progress tracking
        const results: QueryResult[] = [];
        let totalFeatures = 0;

        for (let i = 0; i < layers.length; i++) {
          const layer = layers[i];
          const config = layerConfigs[i];

          // Create layer with config
          const layerWithConfig = {
            esri: layer,
            config: {
              url: config.url,
              where_clause: config.where || "1=1",
              column_mapping: config.columnMapping,
            }
          };

          const result = await queryLayer(layerWithConfig, filterGeometry);
          results.push(result);
          totalFeatures += result.totalCount;
        }

        setProgress(prev => ({
          ...prev,
          totalFeatures,
          totalPages: results.reduce((sum, r) => sum + r.numPages, 0),
          message: `Found ${totalFeatures} features across ${results.length} layer(s)`,
        }));

        // Phase 2: Start downloading features
        setProgress(prev => ({
          ...prev,
          phase: "fetching-features",
          message: "Fetching features from ArcGIS server...",
        }));

        const onWrite = (featuresWritten: number) => {
          setProgress(prev => ({
            ...prev,
            fetchedFeatures: featuresWritten,
            message: `Downloaded ${featuresWritten} of ${totalFeatures} features`,
          }));
        };
        const onConverting = () => {
          setProgress(prev => ({
            ...prev,
            phase: "converting",
            message: format === "PMTiles"
              ? "Converting to PMTiles format using GDAL..."
              : `Converting to ${format} format using GDAL...`,
          }));
        };
        const onZipping = () => {
          setProgress(prev => ({
            ...prev,
            phase: "zipping",
            message: "Creating zip file...",
          }));
        };

        const downloader = new GdalDownloader(onWrite, onConverting, onZipping);
        const extraOgrArgs = format === "PMTiles"
          ? ["-dsco", `MINZOOM=${minZoom}`, "-dsco", `MAXZOOM=${maxZoom}`]
          : [];
        await downloader.download(results, concurrent, format, extraOgrArgs);

        // Phase 5: Complete
        setProgress(prev => ({
          ...prev,
          phase: "complete",
          message: "Download complete! File saved to your Downloads folder.",
        }));

      } catch (err) {
        const error = err as Error;
        console.error("Download error:", error);
        setError(error.message || "An unknown error occurred");
        setErrorDetails(error.stack);
        setProgress(prev => ({
          ...prev,
          phase: "error",
          message: "Download failed",
        }));
      }
    };

    startDownload();
  }, [searchParams]);

  const getPhaseProgress = (phase: DownloadPhase): number => {
    switch (phase) {
      case "idle":
        return PHASE_PROGRESS.idle;
      case "querying-ids":
        return PHASE_PROGRESS["querying-ids"];
      case "fetching-features": {
        const { start, end } = PHASE_PROGRESS["fetching-features"];
        const range = end - start;
        return start + (progress.totalFeatures > 0 ? (progress.fetchedFeatures / progress.totalFeatures) * range : 0);
      }
      case "converting":
        return PHASE_PROGRESS.converting;
      case "zipping":
        return PHASE_PROGRESS.zipping;
      case "complete":
        return PHASE_PROGRESS.complete;
      case "error":
        return PHASE_PROGRESS.error;
      default:
        return 0;
    }
  };

  const getPhaseLabel = (phase: DownloadPhase): string => {
    switch (phase) {
      case "idle":
        return "Initializing";
      case "querying-ids":
        return "Phase 1: Querying for ObjectIDs";
      case "fetching-features":
        return "Phase 2: Fetching Features";
      case "converting":
        return "Phase 3: Converting Format";
      case "zipping":
        return "Phase 4: Creating ZIP";
      case "complete":
        return "Complete";
      case "error":
        return "Error";
      default:
        return "Unknown";
    }
  };

  const getStepIndicatorClass = (
    currentPhase: DownloadPhase,
    activePhases: DownloadPhase[],
    completedPhases: DownloadPhase[]
  ): string => {
    if (completedPhases.includes(currentPhase)) return "bg-green-500";
    if (activePhases.includes(currentPhase)) return "bg-green-500 animate-pulse";
    return "bg-gray-300";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Download Progress
        </h1>

        {progress.phase === "error" && error ? (
          <Alert color="failure" icon={HiOutlineExclamationCircle} className="mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Download Failed</h3>
              <p className="mb-2">{error}</p>
              {errorDetails && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium">Technical Details</summary>
                  <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto max-h-40">
                    {errorDetails}
                  </pre>
                </details>
              )}
              <button
                onClick={() => window.close()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Close Tab
              </button>
            </div>
          </Alert>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {getPhaseLabel(progress.phase)}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {Math.round(getPhaseProgress(progress.phase))}%
                </span>
              </div>
              <Progress
                progress={getPhaseProgress(progress.phase)}
                size="lg"
                color={progress.phase === "complete" ? "green" : "blue"}
                key={`${progress.phase}-${progress.fetchedFeatures}`}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {progress.message}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    getStepIndicatorClass(progress.phase, ["idle", "querying-ids"], ["fetching-features", "converting", "zipping", "complete"])
                  }`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    1. Query ObjectIDs
                  </span>
                </div>
                {progress.totalObjectIds && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {progress.totalObjectIds} objects
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    getStepIndicatorClass(progress.phase, ["fetching-features"], ["converting", "zipping", "complete"])
                  }`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    2. Fetch Features
                  </span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {progress.fetchedFeatures} / {progress.totalFeatures}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    getStepIndicatorClass(progress.phase, ["converting"], ["zipping", "complete"])
                  }`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    3. Convert Format
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    getStepIndicatorClass(progress.phase, ["zipping"], ["complete"])
                  }`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    4. Create ZIP
                  </span>
                </div>
              </div>
            </div>

            {progress.phase === "complete" && (
              <div className="mt-6">
                <Alert color="success" className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Download Complete!</h3>
                  <p>Your file has been saved to your Downloads folder.</p>
                </Alert>
                <button
                  onClick={() => window.close()}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Close Tab
                </button>
              </div>
            )}

            {progress.phase !== "complete" && progress.phase !== "error" && (
              <div className="mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  You can close this tab to cancel the download
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
