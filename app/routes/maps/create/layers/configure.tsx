import { ActionFunctionArgs } from "react-router-dom";
import { getMapConfigLocal, saveMapConfigLocal } from "../../../../database";
import { raise } from "../../../../types";

export const configureLayerAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const url = formData.get("url") as string ?? raise("Url isn't defined")
  const where = formData.get("where") as string ?? raise("Where isn't defined")
  const mapConfig = await getMapConfigLocal()
  const layer = mapConfig.layers.find(l => l.url === url) ?? raise("Unable to find layer")
  const mapping: { [k: string]: string } = {}
  for (const [k, newName] of formData.entries()) {
    console.log(`${k}: ${newName}`)
    if (!k.endsWith("-new")) {
      continue
    }
    const fieldName = k.replace(/-new$/, "")
    console.log(`${k}:   ${fieldName}`)
    const enabled = formData.get(`${fieldName}-enabled`) === "on"
    if (enabled) {
      mapping[fieldName] = newName as string
    }
  }
  layer.column_mapping = mapping
  layer.where_clause = where
  saveMapConfigLocal(mapConfig)
  return mapping
}
