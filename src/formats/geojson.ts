import { QueryResults } from "../arcgis";
import { arcgisToGeoJSON } from '@terraformer/arcgis'
import { chunk } from '../utils'

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
        const getFeaturesCallables = Array.from({ length: numPages })
            .map((_, pageNum) => async () => {
                const features = await results.getPage(pageNum, outFields)
                const json = features.toJSON()
                const geojson = arcgisToGeoJSON(json) as unknown as FeatureCollection
                return {
                    stringified: geojson.features.map(f => JSON.stringify(f)).join(","),
                    numFeatures: geojson.features.length
                }
            })
        // Combine those callables into chunks
        const callableChunks = chunk(getFeaturesCallables, numConcurrent)
        for (let i = 0; i < callableChunks.length; i++) {
            if (i !== 0) {
                await writer.write(",")
            }
            // Actually call the callables
            const calledChunk = callableChunks[i].map(f => f())
            // Wait for all callables to resolve
            const pages = await Promise.all(calledChunk)

            // Join features in chunk together, write to file
            await writer.write(
                pages.map(p => p.stringified).join(",")
            )
            this.featuresWritten += pages.map(p => p.numFeatures).reduce((prev, num) => prev + num, 0)
            // Notify listeners that we've written more features
            this.onWrite(this.featuresWritten)
        }
        writer.write(footer)
        writer.close()
        this.featuresWritten = 0
    }
}