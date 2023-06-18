import { Database } from './database.types'
export type ScheduledDownload = Database["public"]["Tables"]["scheduled_downloads"]["Row"]
export type ScheduledDownloadInsert = Database["public"]["Tables"]["scheduled_downloads"]["Insert"]
export type ScheduledDownloadUpdate = Database["public"]["Tables"]["scheduled_downloads"]["Update"]



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






