import { QueryResult } from "./arcgis";
import { arcgisToGeoJSON } from "@terraformer/arcgis";
import fastq from "fastq";
import type { queueAsPromised } from "fastq";
import { Writer } from "./writer";
import JSZip from "jszip";
import saveAs from "file-saver";
import { getGdalJs } from "./gdal";
import { assertNoArcGISError } from "./arcgis";
import { basename, dirname, extname, join } from "path-browserify";

// Open geojson FeatureCollection object and "features" array
const header = `
{
    "type": "FeatureCollection",
    "features" : [
`;

// Close "features" array opened in header. Close geojson object
const footer = `
    ]
}
`;


interface SpatialReferenceWkid {
  wkid?: number | undefined;
  latestWkid?: number | undefined;
  vcsWkid?: number | undefined;
  latestVcsWkid?: number | undefined;
}

interface SpatialReferenceWkt {
  wkt?: string | undefined;
  latestWkt?: string | undefined;
}

type SpatialReference = SpatialReferenceWkt | SpatialReferenceWkid;


type ArcgisFeatureResp = {
  features: ArcgisFeature[]
  spatialReference?: SpatialReference | undefined;
}

type ArcgisFeature = {
  attributes: {
    [key: string]: string
  }
  geometry: {
    x?: number
    y?: number
    paths?: [
      [
        number[]
      ]
    ];
    rings: [
      [
        number[]
      ]
    ]
  }
}

const containsValidGeometry = ({ geometry }: ArcgisFeature): boolean => {
  if (!geometry) {
    return false
  }
  const { rings, x, y, paths } = geometry
  if (rings) {
    return rings.every(ring => ring?.length > 1)
  }
  if (paths) {
    return paths.every(p => p?.length > 0)
  }
  return x !== undefined && y !== undefined
}


export const DEFAULT_CONCURRENT_REQUESTS = 2;
export const MAX_CONCURRENT_REQUESTS = 20;

export const Drivers: { [key: string]: string[] } = {
  "GPKG": ["gpkg"],
  "GeoJSON": ["geojson"],
  "ESRI Shapefile": ["shp", "dbf", "prj", "shx"],
  "KML": ["kml"],
  "CSV": ["csv"],
  "GPX": ["gpx"],
  "PGDUMP": ["sql"],
  // "SVG": ["svg"],
  "DXF": ["dxf"],
  "SQLite": ["sqlite"],
  // "XSLX": ["xlsx"],
  "PMTiles": ["pmtiles"],
}


/**
 * Fetch all layers as GeoJSON strings.
 *
 * @returns Map of QueryResult → complete GeoJSON FeatureCollection string,
 *          and the total number of features written across all layers.
 */
export async function fetchLayersAsGeoJSON(
  results: QueryResult[],
  numConcurrent: number,
  onWrite: (featuresWritten: number) => void,
): Promise<{ geojsonMap: Map<QueryResult, string>; featuresWritten: number }> {
  const writers = new Map<QueryResult, Writer>();
  let featuresWritten = 0;

  for (const result of results) {
    const writer = new Writer();
    writers.set(result, writer);
    const layer = result.layer;
    if (!layer) {
      throw new Error("layer not defined");
    }
    const numPages = result.numPages;

    const columnMapping = layer?.config?.column_mapping as Record<string, string> | null | undefined;

    writer.write(header);
    let firstPage = true;
    const fetchResults = async (pageNum: number): Promise<void> => {
      const features = await result.getPage(pageNum);
      const json = features.toJSON() as ArcgisFeatureResp;
      assertNoArcGISError(json, `layer ${result.layer.esri?.url ?? result.layer.url}`);
      json.features = json.features.filter(containsValidGeometry);

      const geojson = arcgisToGeoJSON(json) as unknown as GeoJSON.FeatureCollection;

      if (columnMapping && Object.keys(columnMapping).length > 0) {
        geojson.features = geojson.features.map(feature => {
          if (feature.properties) {
            const newProperties: Record<string, any> = {};
            for (const [oldName, newName] of Object.entries(columnMapping)) {
              if (oldName in feature.properties) {
                newProperties[newName] = feature.properties[oldName];
              }
            }
            feature.properties = newProperties;
          }
          return feature;
        });
      }

      let stringified = geojson.features
        .map((f) => JSON.stringify(f))
        .join(",");
      if (firstPage) {
        firstPage = false;
      } else {
        stringified = `, ${stringified}`;
      }
      writer.write(stringified);
      if (!json.features) {
        console.log("json features empty");
      }
      featuresWritten += json.features.length;
      onWrite(featuresWritten);
    };
    const promises: Promise<void>[] = [];
    const q: queueAsPromised<number, void> = fastq.promise(fetchResults, numConcurrent);
    for (let i = 0; i < numPages; i++) {
      promises.push(q.push(i));
    }
    await Promise.all(promises);
    writer.write(footer);
  }

  const geojsonMap = new Map<QueryResult, string>();
  for (const [result, writer] of writers) {
    geojsonMap.set(result, writer.data.join(""));
  }
  return { geojsonMap, featuresWritten };
}


export class GdalDownloader {
  featuresWritten = 0;
  onWrite: (featuresWritten: number) => void;
  onConverting?: () => void;
  onZipping?: () => void;
  zipper: JSZip;
  constructor(
    onWrite: (_: number) => void,
    onConverting?: () => void,
    onZipping?: () => void
  ) {
    this.onWrite = onWrite;
    this.onConverting = onConverting;
    this.onZipping = onZipping;
    this.zipper = new JSZip();
  }
  download = async (
    results: QueryResult[],
    numConcurrent: number,
    format: string,
    extraOgrArgs: string[] = [],
  ) => {
    const Gdal = await getGdalJs();
    const outputPaths: string[] = [];

    // Fetch all features as GeoJSON
    const { geojsonMap, featuresWritten } = await fetchLayersAsGeoJSON(
      results,
      numConcurrent,
      this.onWrite,
    );
    this.featuresWritten = featuresWritten;

    // All features fetched, now convert all layers
    if (this.onConverting) {
      this.onConverting();
    }

    for (const result of results) {
      const geojson = geojsonMap.get(result);
      if (!geojson) {
        throw new Error("GeoJSON not found for result");
      }
      const layerName = result.layer.esri.title;
      const srcDataset = await Gdal.open(
        new File([geojson], `${layerName}.json`)
      );
      const outFilePath = await Gdal.ogr2ogr(srcDataset.datasets[0], [
        "-f",
        format,
        "-skipfailures",
        ...extraOgrArgs,
      ]);

      // Remove the extension from the output file path
      const outBasename = basename(
        outFilePath.local,
        extname(outFilePath.local)
      );
      const outDirname = dirname(outFilePath.local);
      const filePaths = Drivers[format].map((ext) =>
        join(outDirname, `${outBasename}.${ext}`)
      );

      for (const f of filePaths) {
        outputPaths.push(f);
      }
      for (const d of srcDataset.datasets) {
        await Gdal.close(d);
      }
    }
    // If no output files were generated, abort — creating an empty zip is
    // confusing and indicates the conversion/feature fetch likely failed.
    if (outputPaths.length === 0 || this.featuresWritten === 0) {
      throw new Error(
        "No output files were generated. The layer produced no outputs — this may indicate a server error or that no features matched the query."
      );
    }

    // Notify that we're starting zipping
    if (this.onZipping) {
      this.onZipping();
    }

    const zip = new JSZip();
    for (const p of outputPaths) {
      // Gdal.getFileBytes may return a Uint8Array or ArrayBuffer-like type; cast
      // to any here to avoid strict typing issues when constructing the Blob.
      const bytes = await Gdal.getFileBytes(p) as any;
      const blob = new Blob([bytes]);
      const fileName = basename(p);
      zip.file(fileName, blob);
    }
    const zipBytes = await zip.generateAsync({ type: "blob" });
    let fileName = `geodatadownloader.zip`;
    if (results.length === 1) {
      fileName = `${results[0].layer.esri.title}.zip`;
    }
    saveAs(zipBytes, fileName);
    this.featuresWritten = 0;
  };
}
