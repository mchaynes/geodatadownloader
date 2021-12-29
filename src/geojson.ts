import { QueryResults } from "./arcgis";
import { arcgisToGeoJSON } from '@terraformer/arcgis'

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

export class GeojsonDownloader {
    featuresWritten = 0
    onWrite: (featuresWritten: number) => void
    constructor(onWrite: (_: number) => void) {
        this.onWrite = onWrite
    }
    download = async (results: QueryResults, fileHandle: FileSystemFileHandle, outFields: string[]) => {
        const layer = results.getLayer()
        if (!layer) {
            throw new Error("layer not defined")
        }
        const writable = await fileHandle.createWritable()
        const writer = writable.getWriter()
        let headerWritten = false
        let firstPage = true
        while (await results.hasNext()) {
            const features = await results.next(outFields)
            const json = features.toJSON()
            // terraformer library has whack typing
            const geojson = arcgisToGeoJSON(json) as unknown as FeatureCollection
            if (!headerWritten) {
                writer.write(header)
                headerWritten = true
            }
            if (!firstPage) {
                writer.write(",")
            }
            writer.write(
                geojson.features.map(f => JSON.stringify(f)).join(",")
            )
            this.featuresWritten += geojson.features.length
            this.onWrite(this.featuresWritten)
            firstPage = false
        }
        writer.write(footer)
        writer.close()
        this.featuresWritten = 0
    }
}