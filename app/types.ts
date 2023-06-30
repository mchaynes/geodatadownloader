import { Database } from './database.types'
export type MapDlConfig = Database["public"]["Tables"]["map_dl_config"]["Row"]
export interface MapDlConfigTableResp extends MapDlConfig {
  downloads?: Download[]
  map: MapInfo
}
export type MapDlConfigInsert = Database["public"]["Tables"]["map_dl_config"]["Insert"]
export type MapDlConfigUpdate = Database["public"]["Tables"]["map_dl_config"]["Update"]
export type Download = Database["public"]["Tables"]["downloads"]["Row"]
export type DownloadInsert = Database["public"]["Tables"]["downloads"]["Insert"]
export type DownloadUpdate = Database["public"]["Tables"]["downloads"]["Update"]

export type MapInfo = Database["public"]["Tables"]["map"]["Row"]



export type Day = NonNullable<Database["public"]["Enums"]["day"]>
export type Format = NonNullable<Database["public"]["Enums"]["format"]>
export type Frequency = NonNullable<Database["public"]["Enums"]["frequency"]>
export type Status = NonNullable<Database["public"]["Enums"]["status"]>


// Used to enforce that our enum arrays include all values
// Copied from: https://stackoverflow.com/a/60132060/18094166
const arrayOfAll = <T>() => <U extends T[]>(
  array: U & ([T] extends [U[number]] ? unknown : 'Invalid')
) => array;


export const Days = arrayOfAll<Database["public"]["Enums"]["day"]>()([
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
])

export const Formats = arrayOfAll<Database["public"]["Enums"]["format"]>()([
  "pmtiles",
  "shp",
  "csv",
  "gpkg",
  "geojson",
])
export const Frequencies = arrayOfAll<Database["public"]["Enums"]["frequency"]>()([
  "daily",
  "hourly",
  "weekly",
  "monthly",
])
export const Statuses = arrayOfAll<Database["public"]["Enums"]["status"]>()([
  "pending",
  "started",
  "successful",
  "failed",
])






