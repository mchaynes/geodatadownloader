import { describe, it, expect } from '@jest/globals';
import Polygon from '@arcgis/core/geometry/Polygon'
import { parseGeometryFromString } from './arcgis'
import Extent from '@arcgis/core/geometry/Extent';
describe('parseGeometryFromString function', () => {
    it('can parse polygon with no type', () => {
        const polygon = `{"spatialReference":{"latestWkid":3857,"wkid":102100},"rings":[[[-13580702.64934414,6018820.661342948],[-13580702.64934414,6005568.230609587],[-13603599.103639837,6005568.230609587],[-13603599.103639837,6018820.661342948],[-13580702.64934414,6018820.661342948]]]}`
        expect(parseGeometryFromString(polygon)).toStrictEqual(Polygon.fromJSON({
            "spatialReference": {
                "latestWkid": 3857,
                "wkid": 102100
            },
            "rings": [[[-13580702.64934414, 6018820.661342948], [-13580702.64934414, 6005568.230609587], [-13603599.103639837, 6005568.230609587], [-13603599.103639837, 6018820.661342948], [-13580702.64934414, 6018820.661342948]]]
        }))
    })
    it('can parse polygon with type', () => {
        const polygon = `{"type": "polygon","spatialReference":{"latestWkid":3857,"wkid":102100},"rings":[[[-13580702.64934414,6018820.661342948],[-13580702.64934414,6005568.230609587],[-13603599.103639837,6005568.230609587],[-13603599.103639837,6018820.661342948],[-13580702.64934414,6018820.661342948]]]}`
        expect(parseGeometryFromString(polygon)).toStrictEqual(Polygon.fromJSON({
            "spatialReference": {
                "latestWkid": 3857,
                "wkid": 102100
            },
            "rings": [[[-13580702.64934414, 6018820.661342948], [-13580702.64934414, 6005568.230609587], [-13603599.103639837, 6005568.230609587], [-13603599.103639837, 6018820.661342948], [-13580702.64934414, 6018820.661342948]]]
        }))
    })
    it('can parse extent with no type', () => {
        const extent = `{"xmin":-13695772.115565538,"ymin":5897601.423676393,"xmax":-13477949.898652915,"ymax":6158040.514031466,"spatialReference":{"wkid":102100,"latestWkid":3857}}`
        expect(parseGeometryFromString(extent)).toStrictEqual(Extent.fromJSON({
            "xmin": -13695772.115565538,
            "ymin": 5897601.423676393,
            "xmax": -13477949.898652915,
            "ymax": 6158040.514031466,
            "spatialReference": {
                "wkid": 102100,
                "latestWkid": 3857
            }
        }))
    })
    it('can parse extent with type', () => {
        const extent = `{"type": "extent","xmin":-13695772.115565538,"ymin":5897601.423676393,"xmax":-13477949.898652915,"ymax":6158040.514031466,"spatialReference":{"wkid":102100,"latestWkid":3857}}`
        expect(parseGeometryFromString(extent)).toStrictEqual(Extent.fromJSON({
            "xmin": -13695772.115565538,
            "ymin": 5897601.423676393,
            "xmax": -13477949.898652915,
            "ymax": 6158040.514031466,
            "spatialReference": {
                "wkid": 102100,
                "latestWkid": 3857
            }
        }))
    })
})