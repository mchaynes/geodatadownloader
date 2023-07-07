import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import { LoaderFunctionArgs } from "react-router-dom";
import { parseGeometryFromString } from "../../../../arcgis";

export const getQueryResultsLoader = async ({ params }: LoaderFunctionArgs) => {
  const url = params["url"]
  const where = params["where"]
  const extent = params["extent"]
  const geometry = extent ? parseGeometryFromString(extent) : undefined
  const fields = params["fields"]?.split(",")
  // const layer = new FeatureLayer({
  //   url: url
  // })
  // await layer.load()
  // return await layer.queryFeatures({
  //   where: where,
  //   geometry: geometry,
  //   outFields: fields,
  // })
  return null
}
