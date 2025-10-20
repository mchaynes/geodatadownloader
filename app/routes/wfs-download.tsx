import React, { useState } from "react";
import { Alert, Button, Progress, TextInput } from "flowbite-react";
import { isWFSUrl, loadWFSLayer, WFSQueryResults, WFSLayer } from "../wfs";
import { GdalDownloader } from "../downloader";
import { Drivers } from "../downloader";

export default function WFSDownloader() {
  const [wfsUrl, setWfsUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [layer, setLayer] = useState<WFSLayer | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalFeatures, setTotalFeatures] = useState(0);
  const [exportFormat, setExportFormat] = useState("GeoJSON");

  const handleLoadLayer = async () => {
    setError("");
    setLayer(null);
    
    if (!wfsUrl.trim()) {
      setError("Please enter a WFS URL");
      return;
    }

    if (!isWFSUrl(wfsUrl)) {
      setError("The URL doesn't appear to be a WFS service. WFS URLs typically contain '/wfs' or 'service=wfs'");
      return;
    }

    setLoading(true);
    try {
      const loadedLayer = await loadWFSLayer(wfsUrl);
      setLayer(loadedLayer);
      
      // Get feature count
      const queryResults = new WFSQueryResults(loadedLayer, "1=1");
      const count = await queryResults.getTotalCount();
      setTotalFeatures(count);
    } catch (e) {
      const err = e as Error;
      setError(`Failed to load WFS layer: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!layer) return;

    setDownloading(true);
    setError("");
    setProgress(0);

    try {
      const queryResults = new WFSQueryResults(layer, "1=1");
      const downloader = new GdalDownloader((featuresWritten) => {
        setProgress(featuresWritten);
      });

      await downloader.download([queryResults], 2, exportFormat);
    } catch (e) {
      const err = e as Error;
      setError(`Download failed: ${err.message}`);
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          WFS Layer Downloader
        </h1>

        <div className="mb-6">
          <Alert color="info">
            <span className="font-medium">WFS Support!</span> Download features from OGC Web Feature Service (WFS) endpoints.
            Enter a WFS service URL below to get started.
          </Alert>
        </div>

        {error && (
          <div className="mb-6">
            <Alert color="failure">
              <span className="font-medium">Error:</span> {error}
            </Alert>
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="wfs-url" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            WFS Service URL
          </label>
          <div className="flex gap-2">
            <TextInput
              id="wfs-url"
              type="text"
              placeholder="https://example.com/geoserver/wfs?service=wfs&version=2.0.0&typename=mylayer"
              value={wfsUrl}
              onChange={(e) => setWfsUrl(e.target.value)}
              className="flex-1"
              disabled={loading}
            />
            <Button onClick={handleLoadLayer} disabled={loading}>
              {loading ? "Loading..." : "Load Layer"}
            </Button>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Examples: GeoServer WFS, QGIS Server WFS, MapServer WFS
          </p>
        </div>

        {layer && (
          <div className="border-t pt-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Layer Information
            </h2>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</dt>
                  <dd className="text-lg text-gray-900 dark:text-white">{layer.title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type Name</dt>
                  <dd className="text-lg text-gray-900 dark:text-white">{layer.typename}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">WFS Version</dt>
                  <dd className="text-lg text-gray-900 dark:text-white">{layer.version}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Features</dt>
                  <dd className="text-lg text-gray-900 dark:text-white">{totalFeatures.toLocaleString()}</dd>
                </div>
              </dl>
            </div>

            {layer.fields.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Fields</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {layer.fields.map((field, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                      >
                        {field.name} ({field.type})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="format" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Export Format
              </label>
              <select
                id="format"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              >
                {Object.keys(Drivers).map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </div>

            {downloading && (
              <div className="mb-6">
                <Progress
                  progress={totalFeatures > 0 ? (progress / totalFeatures) * 100 : 0}
                  color="blue"
                  size="lg"
                />
                <p className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Downloaded {progress.toLocaleString()} of {totalFeatures.toLocaleString()} features
                </p>
              </div>
            )}

            <Button
              onClick={handleDownload}
              disabled={downloading}
              color="success"
              size="lg"
              className="w-full"
            >
              {downloading ? "Downloading..." : "Download Layer"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
