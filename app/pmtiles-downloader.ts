import JSZip from "jszip";
import saveAs from "file-saver";
import { QueryResult } from "./arcgis";
import { fetchLayersAsGeoJSON } from "./downloader";
import { runTippecanoe } from "./tippecanoe";

export class PMTilesDownloader {
  featuresWritten = 0;
  onWrite: (featuresWritten: number) => void;
  onConverting?: () => void;
  onZipping?: () => void;

  constructor(
    onWrite: (featuresWritten: number) => void,
    onConverting?: () => void,
    onZipping?: () => void,
  ) {
    this.onWrite = onWrite;
    this.onConverting = onConverting;
    this.onZipping = onZipping;
  }

  download = async (
    results: QueryResult[],
    numConcurrent: number,
    minZoom: number,
    maxZoom: number,
  ): Promise<void> => {
    const { geojsonMap, featuresWritten } = await fetchLayersAsGeoJSON(
      results,
      numConcurrent,
      this.onWrite,
    );
    this.featuresWritten = featuresWritten;

    if (this.featuresWritten === 0) {
      throw new Error(
        "No features were fetched. The layer produced no output — this may indicate a server error or that no features matched the query."
      );
    }

    if (this.onConverting) {
      this.onConverting();
    }

    const zip = new JSZip();

    for (const result of results) {
      const geojson = geojsonMap.get(result);
      if (!geojson) {
        throw new Error("GeoJSON not found for result");
      }
      const layerName = result.layer.esri.title;
      const inputFilename = `${layerName}.geojson`;
      const outputFilename = "output.pmtiles";

      const pmtiles = await runTippecanoe(
        new Map([[inputFilename, geojson]]),
        [
          "-o", outputFilename,
          "-Z", String(minZoom),
          "-z", String(maxZoom),
          "--force",
          "--no-progress-indicator",
          inputFilename,
        ],
      );

      zip.file(`${layerName}.pmtiles`, pmtiles);
    }

    if (this.onZipping) {
      this.onZipping();
    }

    const zipBytes = await zip.generateAsync({ type: "blob" });
    const fileName = results.length === 1
      ? `${results[0].layer.esri.title}.zip`
      : "geodatadownloader.zip";
    saveAs(zipBytes, fileName);
    this.featuresWritten = 0;
  };
}
