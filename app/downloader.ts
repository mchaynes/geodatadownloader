import { QueryResults } from "./arcgis";
import { arcgisToGeoJSON } from "@terraformer/arcgis";
import fastq from "fastq";
import type { queueAsPromised } from "fastq";
import { Writer } from "./writer";
import JSZip from "jszip";
import saveAs from "file-saver";
import { getGdalJs } from "./gdal";


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
    return rings.every(ring => ring.length > 1)
  }
  if (paths) {
    return paths.every(p => p.length > 0)
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
  "SVG": ["svg"],
  "DXF": ["dxf"],
  "SQLite": ["sqlite"],
  "XSLX": ["xlsx"],
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
    results: QueryResults,
    writer: Writer,
    outFields: string[],
    numConcurrent: number,
    where: string,
    format: string
  ) => {
    const layer = results.getLayer();
    if (!layer) {
      throw new Error("layer not defined");
    }
    const numPages = await results.getNumPages(where);
    writer.write(header);
    // Create callable functions that fetch results for each page
    let firstPage = true;
    const fetchResults = async (pageNum: number): Promise<void> => {
      const features = await results.getPage(pageNum, outFields, where);
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
    const Gdal = await getGdalJs();
    const layerName = results.getLayer().title;
    const srcDataset = await Gdal.open(
      new File(writer.data, `${layerName}.json`)
    );
    console.log(await Gdal.getInfo(srcDataset.datasets[0]))
    await Gdal.ogr2ogr(srcDataset.datasets[0], ["-f", format, "-skipfailures"]);
    const files = (await Gdal.getOutputFiles()).filter(f => {
      for (const ext of Drivers[format]) {
        if (f.path.includes(`${layerName}.${ext}`)) {
          return true
        }
      }
      return false
    });
    const zip = new JSZip();

    for (const f of files) {
      const blob = new Blob([await Gdal.getFileBytes(f.path)]);
      const fileName = f.path.split("/")[2];
      zip.file(fileName, blob);
    }
    const zipBytes = await zip.generateAsync({ type: "blob" });
    saveAs(zipBytes, `${layerName}.zip`);
    for (const d of srcDataset.datasets) {
      await Gdal.close(d);
    }
    this.featuresWritten = 0;
  };
}
