import { Button, Typography } from "@mui/material";
import { useState } from "react";
import { Link, } from "react-router-dom";
import DownloadScheduleForm from "../../DownloadScheduleForm";
import { supabase } from '../../supabase'
import { ScheduledDownload, ScheduledDownloadInsert } from "../../types";



export default function CreateDownloadSchedule() {
  const [schedule, setScheduled] = useState<ScheduledDownloadInsert>({
    layer_url: "",
    access_key_id: "",
    secret_key: "",
    active: true,
    column_mapping: {},
    day_of_month: 1,
    days_of_week: [],
    format: "gpkg",
    destination: "",
    frequency: "monthly",
    name: "",
    time_of_day: "00:00",
    where_clause: "",
    owner: "",
  })
  const [messages, setMessages] = useState<JSX.Element[]>([])

  async function create() {
    if (schedule) {
      const { data, error } = await supabase.from("scheduled_downloads").insert(schedule).select().single()
      if (error) {
        throw new Error(JSON.stringify(error))
      }
      if (data) {
        const { id, name } = data
        setMessages([
          <>Created scheduled download <Link to={`/schedule/${id}`}>{name}</Link></>,
          ...messages,
        ])
      }
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "10rem" }}>
      <Typography variant="h2">
        Create Scheduled Download
      </Typography>
      <DownloadScheduleForm schedule={schedule} setSchedule={setScheduled} />
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ flexGrow: 1 }} />
        <Button variant="contained" onClick={create}>Create</Button>
      </div>
    </div>
  )
}
