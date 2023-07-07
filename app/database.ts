import dayjs from "dayjs";
import { supabase } from "./supabase";
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

export async function getMapDlConfigsByLastDownloadTime() {
  const resp = await supabase.from("map_dl_config").select("*, downloads(*), map(*)")
  if (resp.error) {
    throw new Error(resp.error.message)
  }
  resp.data.sort((a, b) => {
    if (a.downloads.length === 0 && b.downloads.length === 0) {
      return 0
    }
    if (a.downloads.length === 0) {
      return 1
    }
    if (b.downloads.length === 0) {
      return -1
    }
    const as = a.downloads.sort((a, b) => dayjs(a.updated_at).isBefore(dayjs(b.updated_at)) ? -1 : 1)
    const bs = b.downloads.sort((a, b) => dayjs(a.updated_at).isBefore(dayjs(b.updated_at)) ? -1 : 1)
    return dayjs(as[0].updated_at).isBefore(dayjs(bs[0].updated_at)) ? -1 : 1
  })
  return resp
}

export async function updateScheduledDownloads(dlConfig: MapDlConfigUpdate) {
  const s: MapDlConfigUpdate = { ...dlConfig }
  if ("owner" in s) {
    delete s.owner
  }
  if ("downloads" in s) {
    delete s.downloads
  }
  await supabase.from("map_dl_config")
    .update(s)
    .eq("id", dlConfig.id)
}

export async function saveMap(map: LocalMap) {
  let result = await supabase.from("map")
    .upsert(map.map)
    .select()
    .single()
  if (result.error) {
    throw new Error(result.error.message);
  }
  const mapId = result.data.id
  result = await supabase.from("map_dl_config")
    .upsert({
      ...map.dlConfig,
      map_id: mapId,
    })
    .single()
  if (result.error) {
    throw new Error(result.error.message)
  }
  const layerResults = await supabase.from("layer")
    .upsert(map.layers)
    .select()
  if (layerResults.error) {
    throw new Error(layerResults.error.message)
  }
  const resultMap = await supabase.from("map_layer")
    .upsert(
      layerResults.data.map(l => ({ map_id: mapId, layer_id: l.id }))
    )
  if (resultMap.error) {
    throw new Error(resultMap.error.message)
  }
}

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
