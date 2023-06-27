import dayjs from "dayjs";
import { supabase } from "./supabase";
import { Days, ScheduledDownload, ScheduledDownloadUpdate, ScheduledDownloadWithDownloads } from "./types";



export function scheduledDownloadFromForm(form: FormData) {
  const data = Object.fromEntries(form.entries())
  const sd = data as unknown as ScheduledDownload
  for (const k of Days) {
    if (data[k] === "on") {
      sd.days_of_week = sd.days_of_week ?? []
      sd.days_of_week = [k, ...sd.days_of_week]
      delete sd[k]
    }
  }
  delete sd["intent"]
  return sd
}

export async function getScheduledDownloadsByLastDownloadTime() {
  const resp = await supabase.from("scheduled_downloads").select("*, downloads(*)")
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

export async function updateScheduledDownloads(schedule: ScheduledDownloadUpdate) {
  const s: ScheduledDownloadUpdate = { ...schedule }
  if ("owner" in s) {
    delete s.owner
  }
  if ("downloads" in s) {
    delete s.downloads
  }
  await supabase.from("scheduled_downloads")
    .update(s)
    .eq("id", schedule.id)
}
