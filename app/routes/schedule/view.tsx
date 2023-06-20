import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, TextField, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useRef, useState } from "react";
import { ActionFunction, Form, LoaderFunction, useLoaderData, useNavigate } from "react-router-dom";
import { scheduledDownloadFromForm, updateScheduledDownloads } from "../../database";
import DownloadScheduleForm from "../../DownloadScheduleForm";
import { supabase } from "../../supabase";
import { DownloadInsert, ScheduledDownload, ScheduledDownloadWithDownloads } from "../../types";


export const loader: LoaderFunction = async ({ params }) => {
  if (!params.id) {
    throw new Error("something is messed up with view")
  }
  const { data, error } = await supabase
    .from("scheduled_downloads")
    .select(`*, downloads (*)`)
    .eq('id', params.id)
    .single()
  if (error) {
    throw new Error(JSON.stringify(error))
  }
  return data
}

export const action: ActionFunction = async ({ params, request }) => {
  let formData = await request.formData()
  const data: ScheduledDownload = scheduledDownloadFromForm(formData)
  const intent = formData.get("intent")
  console.log(intent)
  if (intent === "save") {
    await supabase.from("scheduled_downloads")
      .update(data)
      .eq("id", params.id)
  }

  if (intent === "delete") {
    if (confirm("Are you sure?")) {
      await supabase.from("scheduled_downloads")
        .delete()
        .eq("id", params.id)
    }
  }

  return null
}


export default function ViewScheduledDownload() {
  const schedule = useLoaderData() as ScheduledDownloadWithDownloads
  const [edited, setEdited] = useState<typeof schedule>(() => ({
    ...schedule,
  }))
  const [downloads, setDownloads] = useState<DownloadInsert[]>(schedule.downloads ?? [])


  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Typography variant="h2" sx={{ flexGrow: 1 }}>
          Scheduled Download
        </Typography>
      </div>
      <Form method="post">
        <DownloadScheduleForm schedule={edited} />
        <div style={{ padding: "1rem", width: "100%", display: "flex", flexDirection: "row", gap: "1rem" }}>
          <div style={{ flexGrow: 1 }} />
          <Button
            id="delete"
            type="submit"
            name="intent"
            value="delete"
          >
            Delete
          </Button>
          <Button
            type="submit"
            sx={{ justifySelf: "flex-end" }}
            variant="contained"
            name="intent"
            value="save"
          >
            Save
          </Button>
        </div>
      </Form>

      <div style={{ display: "flex", flexDirection: "row", marginTop: "1rem", marginBottom: "1rem" }}>
        <Typography sx={{ flexGrow: 1 }} variant="h2">Download Jobs</Typography>
        <Button
          variant="outlined"
          onClick={async () => {
            const download = {
              owner: (await supabase.auth.getSession()).data?.session?.user.id,
              download_schedule_id: schedule.id,
            }
            await supabase.from("downloads").insert(download)
            setDownloads([
              download,
              ...downloads,
            ])
          }}
        >
          Start New Job
        </Button>
      </div>
      <div style={{ height: "30rem" }}>
        <DataGrid
          columns={[
            {
              field: "id",
              headerName: "Download ID",
              flex: 1,
            },
            {
              field: "status",
              headerName: "Status",
              flex: 1,
            },
            {
              field: "started_at",
              headerName: "Started At",
              flex: 1,
            },
            {
              field: "finished_at",
              headerName: "Finished At",
              flex: 1,
            },
            {
              field: "messages",
              headerName: "Messages",
              flex: 1,
            },
          ]}
          rows={downloads}
        />
      </div>

    </div>
  )
}
