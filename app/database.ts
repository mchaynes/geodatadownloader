import dayjs from "dayjs";
// import { supabase } from "./supabase";
import { Days, LocalMap, MapDlConfig, MapDlConfigUpdate } from "./types";
import { analyzeArcGISEndpoint } from "./traverse";



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

async function migrateLocalMap(map: LocalMap): Promise<LocalMap> {
  // Normalize and repair layers with missing layerId; if we can't determine the sublayer, drop it.
  const normalize = (u: string) => (u ?? "").trim().replace(/\/+$/, "");
  const isFeatureLayerUrl = (u: string) => /(MapServer|FeatureServer)\/\d+$/.test(u);

  let changed = false;
  const repairedLayers: LocalMap["layers"] = [];

  // Cache service analyses to avoid duplicate network calls per service
  const serviceAnalysisCache = new Map<string, Awaited<ReturnType<typeof analyzeArcGISEndpoint>>>();

  // Attempt to resolve service root to a specific sublayer based on saved name/geometry
  for (const lyr of map.layers) {
    const url = normalize(lyr.url);
    if (isFeatureLayerUrl(url)) {
      // Keep canonical normalized URL
      if (url !== lyr.url) {
        changed = true;
      }
      repairedLayers.push({ ...lyr, url });
      continue;
    }

    // Heuristic repair: try to fetch service JSON and match by name (and geometry if needed)
    try {
      // Skip in non-browser contexts where network layer may be unavailable
      if (typeof window === "undefined") {
        // Leave as-is; let runtime health check surface issues in UI
        repairedLayers.push(lyr);
        continue;
      }

      let analysis = serviceAnalysisCache.get(url);
      if (!analysis) {
        analysis = await analyzeArcGISEndpoint(url);
        serviceAnalysisCache.set(url, analysis);
      }
      if (analysis.endpointType !== "service") {
        // Can't repair directory or unknown endpoints reliably; keep as-is
        repairedLayers.push(lyr);
        continue;
      }
      const svcJson = analysis.json as any;
      const layers: Array<{ id: number; name: string; geometryType?: string }> = Array.isArray(svcJson?.layers) ? svcJson.layers : [];
      if (!layers.length) {
        // Keep as-is; UI health check will handle
        repairedLayers.push(lyr);
        continue;
      }

      const targetName = (lyr.name || "").trim().toLowerCase();
      let candidates = layers.filter(l => (l.name || "").trim().toLowerCase() === targetName);

      if (candidates.length > 1 && lyr.geometry_type) {
        const want = (lyr.geometry_type || "").toLowerCase();
        const toSimple = (g?: string) => {
          const s = (g || "").toLowerCase();
          if (s.includes("polygon")) return "polygon";
          if (s.includes("polyline")) return "polyline";
          if (s.includes("point")) return "point";
          if (s.includes("multipoint")) return "multipoint";
          return s;
        };
        candidates = candidates.filter(l => toSimple(l.geometryType) === want);
      }

      if (candidates.length === 1) {
        const id = candidates[0].id;
        const fixedUrl = `${analysis.normalizedUrl.replace(/\/+$/, "")}/${id}`;
        repairedLayers.push({ ...lyr, url: fixedUrl });
        changed = true;
      } else {
        // Ambiguous or no match; leave as-is so the UI can present a cleanup option
        repairedLayers.push(lyr);
      }
    } catch (_err) {
      // Network or parsing error; keep as-is so UI can surface the issue
      repairedLayers.push(lyr);
    }
  }

  if (changed) {
    const repaired: LocalMap = {
      ...map,
      layers: repairedLayers,
    };
    saveMapConfigLocal(repaired);
    return repaired;
  }
  return map;
}

export async function getMapConfigLocal(): Promise<LocalMap> {
  const mapJson = localStorage.getItem("map")
  if (mapJson) {
    const parsed = JSON.parse(mapJson) as LocalMap;
    // Run migration/repair step before returning
    return await migrateLocalMap(parsed);
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
