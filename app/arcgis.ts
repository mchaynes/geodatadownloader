import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet";
import Geometry from "@arcgis/core/geometry/Geometry";
import EsriExtent from "@arcgis/core/geometry/Extent";
import EsriPolygon from "@arcgis/core/geometry/Polygon";

type SpatialReference = {
  wkid: number;
  latestWkid: number;
};

type Polygon = {
  type: "polygon";
  rings: number[][][];
  spatialReference: SpatialReference;
};

type Extent = {
  type: "extent";
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  spatialReference: SpatialReference;
};

type Geo = Polygon | Extent;

export function getRealUrl({ url, layerId }: FeatureLayer) {
  return `${url}/${layerId}`
}

export function parseGeometryFromString(str: string): Geometry {
  const geo = JSON.parse(str) as Geo;
  // allow for type to not be defined
  let type = geo.type;
  if (!type) {
    if ((geo as Polygon).rings) {
      // if it has "rings", then assume a polygon
      type = "polygon";
    } else if ((geo as Extent).xmax) {
      // if it has "xmax" then assume an extent
      type = "extent";
    }
  }
  geo.type = type;
  switch (geo.type) {
    case "extent":
      return EsriExtent.fromJSON({
        type: "extent",
        xmin: geo.xmin,
        ymin: geo.ymin,
        xmax: geo.xmax,
        ymax: geo.ymax,
        spatialReference: geo.spatialReference,
      });
    case "polygon":
      return EsriPolygon.fromJSON({
        type: geo.type,
        spatialReference: geo.spatialReference,
        rings: geo.rings,
      });
    default:
      throw new Error(`Unable to parse geometry: ${str}`);
  }
}

export type GeometryUpdateListener = (_?: Geometry) => void;

export class QueryResults {
  private paginatedObjectIds: number[][] = [];
  private where: string;
  layer: FeatureLayer;
  private queryExtent?: Geometry;
  private pageSize: number;

  constructor(layer: FeatureLayer, queryExtent?: Geometry, pageSize = 200) {
    this.layer = layer;
    this.queryExtent = queryExtent;
    this.pageSize = pageSize;
  }

  private initialize = async (where: string): Promise<void> => {
    if (this.where === where) {
      return;
    }
    const objectIds = await this.getObjectIds(where);
    this.where = where;
    this.paginatedObjectIds = this.paginateIds(objectIds, this.pageSize);
  };

  getPage = async (
    page: number,
    where: string,
    outFields?: string[],
  ): Promise<FeatureSet> => {
    await this.initialize(where);
    if (!this.layer) {
      throw new Error("layer is not set");
    }
    // Find the object id field, default to OBJECTID
    const objectIdField =
      this.layer.fields.find((f) => f.type === "oid")?.name ?? "OBJECTID";

    return await this.layer.queryFeatures({
      where: `${objectIdField} IN (${this.paginatedObjectIds[page].join(",")})`,
      outFields: outFields,
      returnGeometry: true,
      outSpatialReference: {
        // geojson is always in 4326
        wkid: 4326,
      },
    });
  };

  getTotalCount = async (where: string): Promise<number> => {
    return (
      (await this.layer?.queryFeatureCount({
        where: where,
        geometry: this.queryExtent,
      })) || 0
    );
  };

  getNumPages = async (where: string) => {
    await this.initialize(where);
    return this.paginatedObjectIds.length;
  };

  getLayer() {
    return this.layer;
  }

  getPageSize() {
    return this.pageSize;
  }

  /**
   * Queries layer for all objectIds
   * @returns list of all object ids for the server
   */
  private getObjectIds = async (where: string): Promise<number[]> => {
    if (!this.layer) {
      throw new Error("layer is not set");
    }
    return await this.layer?.queryObjectIds({
      where: where,
      geometry: this.queryExtent,
      spatialRelationship: this.queryExtent ? "intersects" : undefined,
    });
  };

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
    const chunkedIds: number[][] = [];
    let currentChunk: number[] = [];
    for (const id of ids) {
      currentChunk.push(id);
      if (currentChunk.length === pageSize) {
        chunkedIds.push(currentChunk);
        currentChunk = [];
      }
    }
    if (currentChunk.length !== pageSize) {
      chunkedIds.push(currentChunk);
    }
    return chunkedIds;
  }
}
