import { Days, LocalMap, MapDlConfig } from "./types";



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


let _mapConfig: LocalMap = {
  layers: [],
  dlConfig: {},
  map: {
    name: "",
    boundary: "",
  }
};

export function getMapConfigSync(): LocalMap {
  return _mapConfig;
}

export async function getMapConfigLocal(): Promise<LocalMap> {
  return _mapConfig;
}

export function saveMapConfigLocal(map: LocalMap) {
  _mapConfig = map;
}
