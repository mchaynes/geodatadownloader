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
import { WFSQueryResults } from "./wfs";

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
}


export class GdalDownloader {
  featuresWritten = 0;
  onWrite: (featuresWritten: number) => void;
  zipper: JSZip;
  constructor(onWrite: (_: number) => void) {
    this.onWrite = onWrite;
    this.zipper = new JSZip();
  }
  download = async (
    results: Array<QueryResult | WFSQueryResults>,
    numConcurrent: number,
    format: string
  ) => {
    const Gdal = await getGdalJs();
    const outputPaths: string[] = [];
    for (const result of results) {
      const writer = new Writer();
      const layer = result.layer;
      if (!layer) {
        throw new Error("layer not defined");
      }
      // Handle both old QueryResult (numPages property) and WFSQueryResults (getNumPages method)
      const numPages = typeof (result as any).numPages === 'number' 
        ? (result as any).numPages 
        : await result.getNumPages();
      writer.write(header);
      // Create callable functions that fetch results for each page
      let firstPage = true;
      const fetchResults = async (pageNum: number): Promise<void> => {
        const features = await result.getPage(pageNum);
        
        let geojson: GeoJSON.FeatureCollection;
        
        // Check if this is a WFS layer (has typename property) or ArcGIS layer
        if ('typename' in layer) {
          // WFS layer - features are already in GeoJSON format from the FeatureSet
          geojson = {
            type: "FeatureCollection",
            features: features.features.map(f => ({
              type: "Feature",
              geometry: f.geometry ? (f.geometry as any) : null,
              properties: f.attributes || {}
            }))
          };
        } else {
          // ArcGIS layer - convert using arcgisToGeoJSON
          const json = features.toJSON() as ArcgisFeatureResp;
          // Detect ArcGIS embedded error payloads and abort so the UI can
          // surface the server message instead of producing an empty zip.
          assertNoArcGISError(json, `layer ${(layer as any).esri?.url ?? (layer as any).url}`);
          // strip features that contain no geometry
          json.features = json.features.filter(containsValidGeometry)
          geojson = arcgisToGeoJSON(json) as unknown as GeoJSON.FeatureCollection;
        }

        let stringified = geojson.features
          .map((f) => JSON.stringify(f))
          .join(",");
        if (firstPage) {
          // we are the first page, so new pages are no longer first
          firstPage = false;
        } else {
          // add a leading "," if this isn't the first page we fetched
          stringified = `, ${stringified}`;
        }
        // Join features in chunk together, write to file
        writer.write(stringified);
        if (!geojson.features) {
          console.log("geojson features empty")
        }
        this.featuresWritten += geojson.features.length;
        // Notify listeners that we've written more features
        this.onWrite(this.featuresWritten);
      };
      const promises: Promise<void>[] = [];
      const q: queueAsPromised<number, void> = fastq.promise(
        fetchResults,
        numConcurrent
      );
      for (let i = 0; i < numPages; i++) {
        promises.push(q.push(i));
      }
      await Promise.all(promises);
      writer.write(footer);
      
      // Get layer name based on type
      const layerName = 'typename' in layer ? layer.title : (layer as any).esri.title;
      
      const srcDataset = await Gdal.open(
        new File(writer.data, `${layerName}.json`)
      );
      const outFilePath = await Gdal.ogr2ogr(srcDataset.datasets[0], [
        "-f",
        format,
        "-skipfailures",
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
      const firstLayer = results[0].layer;
      fileName = 'typename' in firstLayer 
        ? `${firstLayer.title}.zip` 
        : `${(firstLayer as any).esri.title}.zip`;
    }
    saveAs(zipBytes, fileName);
    this.featuresWritten = 0;
  };
}
