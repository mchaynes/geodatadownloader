import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Layer from "@arcgis/core/layers/Layer";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet";
import Geometry from "@arcgis/core/geometry/Geometry";
import EsriExtent from "@arcgis/core/geometry/Extent";
import EsriPolygon from "@arcgis/core/geometry/Polygon";
import { EsriLayerWithConfig } from "./types";

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
  // Normalize: remove trailing slashes
  const base = url.replace(/\/+$/, "");
  // If URL already ends with a numeric id, return as-is
  const last = base.split("/").pop();
  if (last && /^\d+$/.test(last)) {
    return base;
  }
  // If layerId is defined, append it; otherwise return normalized base
  return layerId !== undefined && layerId !== null ? `${base}/${layerId}` : base;
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

const pageSize = 200;


export async function queryLayer(layer, filterExtent?: Geometry) {
  const objectIds = await layer.esri.queryObjectIds({
    where: layer?.config?.where_clause ?? "1=1",
    geometry: filterExtent,
    spatialRelationship: filterExtent ? "intersects" : undefined,
  });

  const chunkedIds: number[][] = [];
  let currentChunk: number[] = [];
  for (const id of objectIds) {
    currentChunk.push(id);
    if (currentChunk.length === pageSize) {
      chunkedIds.push(currentChunk);
      currentChunk = [];
    }
  }
  if (currentChunk.length !== pageSize) {
    chunkedIds.push(currentChunk);
  }

  // Determine which fields to fetch based on column_mapping
  let outFields: string[] = ["*"];
  if (layer?.config?.column_mapping && typeof layer.config.column_mapping === 'object') {
    const columnMapping = layer.config.column_mapping as Record<string, string>;
    // Only fetch the original field names that are in the mapping (i.e., selected)
    outFields = Object.keys(columnMapping);
  }

  return {
    getPage: async (page: number) => {
      // Find the object id field, default to OBJECTID
      const objectIdField =
        layer.esri.fields.find((f) => f.type === "oid")?.name ?? "OBJECTID";

      return await layer.esri.queryFeatures({
        where: `${objectIdField} IN (${chunkedIds[page].join(",")})`,
        outFields: outFields,
        returnGeometry: true,
        outSpatialReference: {
          // geojson is always in 4326
          wkid: 4326,
        },
      });
    },
    numPages: chunkedIds.length,
    totalCount: objectIds.length,
    layer: layer,
  }
}

/**
 * Throw if an ArcGIS JSON response contains an `error` object.
 * Some ArcGIS servers return HTTP 200 but include an error payload like:
 * { error: { code: 500, message: "..." } }
 */
export function assertNoArcGISError(json: unknown, context?: string) {
  if (json && (json as any).error) {
    const errObj = (json as any).error;
    const msg = typeof errObj === "string" ? errObj : errObj?.message ?? JSON.stringify(errObj);
    throw new Error(`ArcGIS server error${context ? ` (${context})` : ""}: ${msg}`);
  }
}

export type QueryResult = Awaited<ReturnType<typeof queryLayer>>

export class QueryResults {
  private paginatedObjectIds: number[][] = [];
  private where: string;
  layer: FeatureLayer;
  private queryExtent?: Geometry;
  private pageSize: number;

  constructor(layer: FeatureLayer, where: string, queryExtent?: Geometry, pageSize = 200) {
    this.layer = layer;
    this.where = where
    this.queryExtent = queryExtent;
    this.pageSize = pageSize;
  }

  private initialize = async (): Promise<void> => {
    const objectIds = await this.getObjectIds();
    this.paginatedObjectIds = this.paginateIds(objectIds, this.pageSize);
  };

  getPage = async (
    page: number,
    outFields?: string[],
  ): Promise<FeatureSet> => {
    await this.initialize();
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

  getTotalCount = async (): Promise<number> => {
    return (
      (await this.layer?.queryFeatureCount({
        where: this.where,
        geometry: this.queryExtent,
      })) || 0
    );
  };

  getNumPages = async () => {
    await this.initialize();
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
  private getObjectIds = async (): Promise<number[]> => {
    if (!this.layer) {
      throw new Error("layer is not set");
    }
    return await this.layer?.queryObjectIds({
      where: this.where,
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
