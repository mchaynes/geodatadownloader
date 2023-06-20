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
