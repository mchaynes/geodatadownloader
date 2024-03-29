import { QueryResults } from "../arcgis";
import { arcgisToGeoJSON } from "@terraformer/arcgis";
import fastq from "fastq";
import type { queueAsPromised } from "fastq";
import { Writer } from "./writer";

export interface Downloader {
  download(
    results: QueryResults,
    writer: Writer,
    outFields: string[],
    numConcurrent: number,
    where: string
  ): Promise<void>;
}

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

export type FeatureCollection = {
  features: Feature[];
};

export type Feature = {
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  id: number | string;
  properties: {
    [key: string]: any;
  };
};

export const DEFAULT_CONCURRENT_REQUESTS = 2;
export const MAX_CONCURRENT_REQUESTS = 20;

export class GeojsonDownloader {
  featuresWritten = 0;
  onWrite: (featuresWritten: number) => void;
  constructor(onWrite: (_: number) => void) {
    this.onWrite = onWrite;
  }
  download = async (
    results: QueryResults,
    writer: Writer,
    outFields: string[],
    numConcurrent: number,
    where: string
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
      const json = features.toJSON();
      // strip features that contain no geometry
      json["features"] = json["features"].filter(f => {
        const rings: Array<number[]> = f["geometry"]["rings"]
        return rings.every(r => r.length > 1)
      })
      const geojson = arcgisToGeoJSON(json) as unknown as FeatureCollection;
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
    writer.save();
    this.featuresWritten = 0;
  };
}
