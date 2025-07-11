import dayjs from "dayjs";
// import { supabase } from "./supabase";
import { Days, LocalMap, MapDlConfig, MapDlConfigUpdate } from "./types";



export function dlConfigFromForm(form: FormData) {
  const data = Object.fromEntries(form.entries())
  const sd = data as unknown as MapDlConfig
  sd.active = form.get("active") === "on"
  for (const k of Days) {
    if (data[k] === "on") {
      sd.days_of_week = sd.days_of_week ?? []
      sd.days_of_week = [k, ...sd.days_of_week]
      delete sd[k]
    }
  }
  const timeOfDay = form.get("time_of_day")
  if (timeOfDay) {
    sd.time_of_day = `0${timeOfDay}:00`.slice(-5)
  }
  delete sd["intent"]
  return sd
}


// export async function updateScheduledDownloads(dlConfig: MapDlConfigUpdate) {
//   const s: MapDlConfigUpdate = { ...dlConfig }
//   if ("owner" in s) {
//     delete s.owner
//   }
//   if ("downloads" in s) {
//     delete s.downloads
//   }
//   await supabase.from("map_dl_config")
//     .update(s)
//     .eq("id", dlConfig.id)
// }

// export async function saveMap(map: LocalMap) {
//   let result = await supabase.from("map")
//     .upsert(map.map)
//     .select()
//     .single()
//   if (result.error) {
//     throw new Error(result.error.message);
//   }
//   const mapId = result.data.id
//   result = await supabase.from("map_dl_config")
//     .upsert({
//       ...map.dlConfig,
//       map_id: mapId,
//     })
//     .single()
//   if (result.error) {
//     throw new Error(result.error.message)
//   }
//   const layerResults = await supabase.from("layer")
//     .upsert(map.layers)
//     .select()
//   if (layerResults.error) {
//     throw new Error(layerResults.error.message)
//   }
//   const resultMap = await supabase.from("map_layer")
//     .upsert(
//       layerResults.data.map(l => ({ map_id: mapId, layer_id: l.id }))
//     )
//   if (resultMap.error) {
//     throw new Error(resultMap.error.message)
//   }
// }

export async function getMapConfigLocal(): Promise<LocalMap> {
  const mapJson = localStorage.getItem("map")
  if (mapJson) {
    return JSON.parse(mapJson) as LocalMap
  }
  saveMapConfigLocal({
    layers: [],
    dlConfig: {},
    map: {
      name: "",
      boundary: "",
    }
  })
  return getMapConfigLocal()
}

export function saveMapConfigLocal(map: LocalMap) {
  localStorage.setItem("map", JSON.stringify(map))
}
