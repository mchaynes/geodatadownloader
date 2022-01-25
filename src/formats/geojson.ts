import { QueryResults } from "../arcgis";
import { arcgisToGeoJSON } from '@terraformer/arcgis'
import * as fastq from 'fastq'
import type { queueAsPromised } from "fastq";


// Open geojson FeatureCollection object and "features" array
const header = `
{
    "type": "FeatureCollection",
    "features" : [
`

// Close "features" array opened in header. Close geojson object
const footer = `
    ]
}
`

type FeatureCollection = {
    features: {
        geometry: {
            type: string
            coordinates: Array<Array<Array<number>>>
        }
        id: number | string
        properties: {
            [key: string]: any
        }
    }[]
}

export const DEFAULT_CONCURRENT_REQUESTS = 2
export const MAX_CONCURRENT_REQUESTS = 20

export class GeojsonDownloader {
    featuresWritten = 0
    onWrite: (featuresWritten: number) => void
    constructor(onWrite: (_: number) => void) {
        this.onWrite = onWrite
    }
    download = async (results: QueryResults, fileHandle: FileSystemFileHandle, outFields: string[], numConcurrent: number) => {
        const layer = results.getLayer()
        if (!layer) {
            throw new Error("layer not defined")
        }
        const writable = await fileHandle.createWritable()
        const writer = writable.getWriter()
        const numPages = await results.getNumPages()
        writer.write(header)
        // Create callable functions that fetch results for each page
        let firstPage = true
        const fetchResults = async (pageNum: number): Promise<void> => {
            const features = await results.getPage(pageNum, outFields)
            const json = features.toJSON()
            const geojson = arcgisToGeoJSON(json) as unknown as FeatureCollection
            let stringified = geojson.features.map(f => JSON.stringify(f)).join(",")
            if (firstPage) {
                // we are the first page, so new pages are no longer first
                firstPage = false
            } else {
                // add a leading "," if this isn't the first page we fetched
                stringified = "," + stringified
            }
            // Join features in chunk together, write to file
            await writer.write(
                stringified
            )
            this.featuresWritten += geojson.features.length
            // Notify listeners that we've written more features
            this.onWrite(this.featuresWritten)
        }
        const promises: Array<Promise<void>> = []
        const q: queueAsPromised<number, void> = fastq.promise(fetchResults, numConcurrent)
        for (let i = 0; i < numPages; i++) {
            promises.push(q.push(i))
        }
        await Promise.all(promises)
        writer.write(footer)
        writer.close()
        this.featuresWritten = 0
    }

}