import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, Tab, Tabs, TextField, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useState } from "react";
import { ActionFunction, Form, LoaderFunction, useLoaderData, useNavigate } from "react-router-dom";
import { scheduledDownloadFromForm } from "../../database";
import DownloadScheduleForm from "../../DownloadScheduleForm";
import { supabase } from "../../supabase";
import { ScheduledDownload, ScheduledDownloadWithDownloads } from "../../types";


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
    return await supabase.from("scheduled_downloads")
      .update(data)
      .eq("id", params.id)
  }

  if (intent === "delete") {
    if (confirm("Are you sure?")) {
      return await supabase.from("scheduled_downloads")
        .delete()
        .eq("id", params.id)
    }
  }

  if (intent === "new_download") {
    const download = {
      owner: (await supabase.auth.getSession()).data?.session?.user.id,
      download_schedule_id: params.id,
    }
    return await supabase.from("downloads").insert(download)
  }

  return null
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <>{children}</>
      )}
    </div>
  );
}


export default function ViewScheduledDownload() {
  const schedule = useLoaderData() as ScheduledDownloadWithDownloads

  const [selectedTab, setSelectedTab] = useState(0)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
      <Tabs value={selectedTab} onChange={(_, newVal) => setSelectedTab(newVal)}>
        <Tab label="Properties" />
        <Tab label="Downloads" />
      </Tabs>
      <TabPanel value={selectedTab} index={0}>
        <Form method="post">
          <DownloadScheduleForm schedule={schedule} />
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
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        <div style={{ display: "flex", flexDirection: "row", marginTop: "1rem", marginBottom: "1rem" }}>
          <Typography sx={{ flexGrow: 1 }} variant="h2">Download Jobs</Typography>
          <Form method="post">
            <Button
              variant="contained"
              name="intent"
              value="new_download"
              type="submit"
            >
              Trigger Download
            </Button>
          </Form>
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
            rows={schedule?.downloads ?? []}
            autoHeight={true}
          />
        </div>
      </TabPanel>

    </div>
  )
}
