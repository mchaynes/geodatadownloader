import { QueryResult } from "./arcgis";
import { arcgisToGeoJSON } from "@terraformer/arcgis";
import fastq from "fastq";
import type { queueAsPromised } from "fastq";
import { Writer } from "./writer";
import JSZip from "jszip";
import saveAs from "file-saver";
import { getGdalJs } from "./gdal";
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
    results: QueryResult[],
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
      const numPages = result.numPages;
      writer.write(header);
      // Create callable functions that fetch results for each page
      let firstPage = true;
      const fetchResults = async (pageNum: number): Promise<void> => {
        const features = await result.getPage(pageNum);
        const json = features.toJSON() as ArcgisFeatureResp;
        // strip features that contain no geometry
        json.features = json.features.filter(containsValidGeometry)

        const geojson = arcgisToGeoJSON(json) as unknown as GeoJSON.FeatureCollection;
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
        if (!json.features) {
          console.log("json features empty")
        }
        this.featuresWritten += json.features.length;
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
      const layerName = result.layer.esri.title;
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
    const zip = new JSZip();
    for (const p of outputPaths) {
      const blob = new Blob([await Gdal.getFileBytes(p)]);
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
