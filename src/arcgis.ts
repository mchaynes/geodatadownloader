import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import Sketch from '@arcgis/core/widgets/Sketch'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import FeatureEffect from '@arcgis/core/layers/support/FeatureEffect'
import FeatureFilter from '@arcgis/core/layers/support/FeatureFilter'
import FeatureSet from "@arcgis/core/rest/support/FeatureSet";
import { union as geometryUnion } from '@arcgis/core/geometry/geometryEngine'
import Geometry from '@arcgis/core/geometry/Geometry'

export class Arcgis {
    layerUrl?: string
    layer?: FeatureLayer
    map: Map
    mapView: MapView
    sketch: Sketch
    sketchLayer: GraphicsLayer
    filterGeometry?: Geometry
    attachedAndLoaded = false
    outFields = ["*"]
    filterGeomHooks: ((_?: Geometry) => void)[] = []
    constructor() {
        this.sketchLayer = new GraphicsLayer()
        this.map = new Map({
            basemap: "topo-vector",
        })
        this.mapView = new MapView({
            map: this.map,
            center: [0, 0],
            zoom: 1,
        })
        // Only initializing to fix compiler errors 
        this.sketchLayer = new GraphicsLayer()
        this.sketch = new Sketch()
    }

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
        this.map.add(this.layer)
        await this.layer?.load()
        return this.layer?.title ?? "<No Title>"
    }

    async zoomToLayer() {
        const extent = await this.layer?.queryExtent()
        await this.mapView.goTo(extent)
    }

    attachView = async (container: any) => {
        this.mapView.container = container
        if (!this.attachedAndLoaded) {
            this.sketchLayer = new GraphicsLayer()
            this.sketch = new Sketch({
                layer: this.sketchLayer,
                view: this.mapView,
                creationMode: "update",
                availableCreateTools: ["polygon", "rectangle", "circle"],
                layout: "vertical",
            })
            this.map.add(this.sketchLayer)
            this.mapView.ui.add(this.sketch, "top-right")
            this.attachedAndLoaded = true
            this.sketch.on("update", this.syncSketch(this.sketchLayer))
            await this.mapView.when()
            await this.zoomToLayer()
        }
    }

    syncSketch(sketchLayer: GraphicsLayer) {
        return () => {
            const sketchGeometries = sketchLayer.graphics
                .filter((g) => g?.geometry?.spatialReference !== undefined)
                .map((g) => g.geometry).toArray()
            if (sketchGeometries.length > 0) {
                this.filterGeometry = geometryUnion(sketchGeometries)
            } else {
                // If there's no sketch geometries, remove the filterGeometry entirely
                this.filterGeometry = undefined
            }
            this.syncFeatureEffect()
        }
    }

    onNewFilterGeometry = (f: (_?: Geometry) => void) => {
        this.filterGeomHooks.push(f)
    }

    syncFeatureEffect() {
        if (this.layer) {
            this.layer.featureEffect = new FeatureEffect({
                filter: new FeatureFilter({
                    geometry: this.filterGeometry,
                    spatialRelationship: "intersects",
                }),
                excludedEffect: "grayscale(100%) opacity(30%)"
            })
            this.filterGeomHooks.forEach(func => func(this.filterGeometry))
        }
    }


    /**
     * Queries layer for all objectIds
     * @returns list of all object ids for the server
     */
    getObjectIds = async (where = "1=1"): Promise<number[]> => {
        if (this.layer) {
            return await this.layer.queryObjectIds({
                where: where,
            })
        } else {
            return Promise.reject("layer is not defined")
        }
    }

}

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