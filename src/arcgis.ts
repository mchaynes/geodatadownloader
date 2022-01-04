import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import FeatureSet from "@arcgis/core/rest/support/FeatureSet";
import Geometry from '@arcgis/core/geometry/Geometry'
import EsriExtent from '@arcgis/core/geometry/Extent'
import EsriPolygon from '@arcgis/core/geometry/Polygon'

export class Arcgis {
    layerUrl?: string
    layer?: FeatureLayer
    outFields: string[] = []
    getLayerUrl() {
        return this.layerUrl
    }

    getLayer() {
        return this.layer
    }

    getTitle() {
        return this.layer?.title
    }

    getFields() {
        return this.layer?.fields
    }

    setOutFields(outFields: string[]) {
        this.outFields = outFields
    }

    getOutFields() {
        return this.outFields
    }

    /**
     * Responsible for loading the layer and adding to the map 
     * @returns title of layer
     */
    loadLayer = async (layerUrl: string): Promise<string> => {
        this.layerUrl = layerUrl
        this.layer = new FeatureLayer({
            url: layerUrl,
        })
        await this.layer?.load()
        return this.layer?.title ?? "<No Title>"
    }

}

type SpatialReference = {
    wkid: number,
    latestWkid: number,
}

type Polygon = {
    type: "polygon"
    rings: number[][][]
    spatialReference: SpatialReference
}

type Extent = {
    type: "extent",
    xmin: number,
    ymin: number,
    xmax: number,
    ymax: number,
    spatialReference: SpatialReference
}

type Geo = Polygon | Extent

export function parseGeometryFromString(str: string): Geometry {
    const geo = JSON.parse(str) as Geo
    // allow for type to not be defined
    let type = geo.type
    if (!type) {
        if ((geo as Polygon).rings) { // if it has "rings", then assume a polygon
            type = "polygon"
        } else if ((geo as Extent).xmax) { // if it has "xmax" then assume an extent
            type = "extent"
        }
    }
    geo.type = type
    switch (geo.type) {
        case "extent":
            return EsriExtent.fromJSON({
                "type": "extent",
                "xmin": geo.xmin,
                "ymin": geo.ymin,
                "xmax": geo.xmax,
                "ymax": geo.ymax,
                "spatialReference": geo.spatialReference,
            })
        case "polygon":
            return EsriPolygon.fromJSON({
                "type": geo.type,
                "spatialReference": geo.spatialReference,
                "rings": geo.rings
            })
        default:
            throw new Error(`Unable to parse geometry: ${str}`)
    }
}

export type GeometryUpdateListener = (_?: Geometry) => void

export class QueryResults {
    private paginatedObjectIds: number[][] = []
    private i = 0
    private initialized = false
    private where: string
    private layer?: FeatureLayer
    private queryExtent?: Geometry
    private pageSize: number
    private totalCount: number

    constructor(layer?: FeatureLayer, queryExtent?: Geometry, pageSize = 200, where = "1=1") {
        this.layer = layer
        this.queryExtent = queryExtent
        this.where = where
        this.pageSize = pageSize
        this.totalCount = 0
    }

    /**
     * Initializes paginator. If where string changes, it will reload objectIds according to new where clause
     */
    private initialize = async (): Promise<void> => {
        if (this.initialized) {
            return
        }
        const objectIds = await this.getObjectIds(this.where)
        this.totalCount = objectIds.length
        this.paginatedObjectIds = this.paginateIds(objectIds, this.pageSize)
        this.initialized = true

    }

    /**
     * Reset resets page state back to 0. Useful for re-querying data 
     */
    reset = () => {
        this.i = 0
    }

    next = async (outFields: string[]): Promise<FeatureSet> => {
        const features = await this.getPage(this.i, outFields)
        this.i++
        return features
    }

    hasNext = async (): Promise<boolean> => {
        await this.initialize()
        return this.i < this.paginatedObjectIds.length
    }

    getPage = async (page: number, outFields: string[]): Promise<FeatureSet> => {
        await this.initialize()
        if (!this.layer) {
            throw new Error("layer is not set")
        }

        return await this.layer?.queryFeatures({
            where: `OBJECTID IN (${this.paginatedObjectIds[page].join(",")})`,
            outFields: outFields,
            returnGeometry: true,
            outSpatialReference: {
                wkid: 4326
            }
        })
    }

    getTotalCount = async () => {
        await this.initialize()
        return this.totalCount
    }

    getNumPages = async () => {
        await this.initialize()
        return this.paginatedObjectIds.length
    }

    getLayer() {
        return this.layer
    }

    getPageSize() {
        return this.pageSize
    }


    /**
      * Queries layer for all objectIds
      * @returns list of all object ids for the server
      */
    private getObjectIds = async (where: string): Promise<number[]> => {
        if (!this.layer) {
            throw new Error("layer is not set")
        }
        return await this.layer?.queryObjectIds({
            where: where,
            geometry: this.queryExtent,
            spatialRelationship: this.queryExtent ? "intersects" : undefined
        })
    }

    /**
     * From:
     *   [1, 2, 3, 4, 5, 6, 7, 9, 10]
     * To (chunkSize=2):
     *   [[1,2], [3,4], [5,6], [7,8], [9,10]]
     * @param ids object ids to chunk
     * @param pageSize size of each page 
     * @returns pages of ids 
     */
    private paginateIds(ids: number[], pageSize = 200): number[][] {
        const chunkedIds: number[][] = []
        let currentChunk: number[] = []
        for (let i in ids) {
            const id = ids[i]
            currentChunk.push(id)
            if (currentChunk.length === pageSize) {
                chunkedIds.push(currentChunk)
                currentChunk = []
            }
        }
        if (currentChunk.length !== pageSize) {
            chunkedIds.push(currentChunk)
        }
        return chunkedIds
    }
}