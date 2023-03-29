import { arcgisToGeoJSON } from "@terraformer/arcgis";
import { createObjectCsvStringifier } from "csv-writer-browser";
import { QueryResults } from "../arcgis";
import { FeatureCollection } from "./geojson";
import fastq, { queueAsPromised } from "fastq";
import { Writer } from "./writer";

export class CsvDownloader {
  onWrite: (featuresWritten: number) => void;
  featuresWritten: number;
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
    // Create callable functions that fetch results for each page
    let firstPage = true;
    const fetchResults = async (pageNum: number): Promise<void> => {
      const features = await results.getPage(pageNum, outFields, where);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const json = features.toJSON();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const geojson = arcgisToGeoJSON(json) as unknown as FeatureCollection;
      const csvStringifier = createObjectCsvStringifier({
        header: [
          { id: "geometry", title: "geometry" },
          ...features.fields.map((f) => ({ id: f.name, title: f.name })),
        ],
      });
      let stringified = csvStringifier.stringifyRecords(
        geojson.features.map((f) => ({
          geometry: JSON.stringify(f.geometry),
          ...f.properties,
        }))
      );
      if (firstPage) {
        writer.write(csvStringifier.getHeaderString() ?? "");
        // we are the first page, so new pages are no longer first
        firstPage = false;
      } else {
        // add a leading "\n" if this isn't the first page we fetched
        stringified = "\n" + stringified;
      }
      // Join features in chunk together, write to file
      writer.write(stringified);
      this.featuresWritten += geojson.features.length;
      // Notify listeners that we've written more features
      this.onWrite(this.featuresWritten);
    };
    const promises: Array<Promise<void>> = [];
    const q: queueAsPromised<number, void> = fastq.promise(
      fetchResults,
      numConcurrent
    );
    for (let i = 0; i < numPages; i++) {
      promises.push(q.push(i));
    }
    await Promise.all(promises);
    writer.save("text/csv");
    this.featuresWritten = 0;
  };
}
