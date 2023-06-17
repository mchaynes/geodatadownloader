import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { DataStore } from "aws-amplify";
import { useEffect, useState } from "react";
import { LoaderFunction, useLoaderData, useNavigate, useParams } from "react-router-dom";
import DownloadScheduleForm from "../../DownloadScheduleForm";
import { Downloads, DownloadSchedule, Formats, Frequency } from "../../models";


function deepEqual(x, y) {
  if (x === y) {
    return true;
  }
  else if ((typeof x == "object" && x != null) && (typeof y == "object" && y != null)) {
    if (Object.keys(x).length != Object.keys(y).length)
      return false;

    for (var prop in x) {
      if (y.hasOwnProperty(prop)) {
        if (!deepEqual(x[prop], y[prop]))
          return false;
      }
      else
        return false;
    }

    return true;
  }
  else
    return false;
}

type FooterProps = {
  disabled: boolean
  onSave: () => void
  onDelete: () => void
}

function Footer({ onSave, onDelete, disabled }: FooterProps) {
  const [showDialog, setShowDialog] = useState(false)
  return (
    <div style={{ padding: "1rem", width: "100%", display: "flex", flexDirection: "row", gap: "1rem" }}>
      <div style={{ flexGrow: 1 }} />
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
      >
        <DialogTitle>Delete Scheduled Download?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deletion will permanently erase any configuration, and all download history.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setShowDialog(false)}>
            Dismiss
          </Button>
          <Button variant="contained" onClick={onDelete}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Button onClick={() => setShowDialog(true)}>
        Delete
      </Button>
      <Button
        disabled={disabled}
        sx={{ justifySelf: "flex-end" }}
        variant="contained"
        onClick={onSave}
      >
        Save
      </Button>
    </div>
  )
}

export const loader: LoaderFunction = async ({ params }) => {
  if (!params.id) {
    throw new Error("something is messed up with view")
  }
  return await DataStore.query(DownloadSchedule, params.id)
}



export default function ViewScheduledDownload() {
  const schedule = useLoaderData() as DownloadSchedule
  const [downloadSchedule, setDownloadSchedule] = useState<DownloadSchedule>(schedule)
  const [edited, setEdited] = useState<DownloadSchedule>(() => DownloadSchedule.copyOf(schedule, () => { }))
  const [downloads, setDownloads] = useState<Downloads[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [disabled, setDisabled] = useState(true)
  const params = useParams()
  const navigate = useNavigate()
  useEffect(() => {
    const { id } = params
    if (!id) {
      throw new Error(`id is not set`)
    }
    const downloadSub = DataStore.observeQuery(Downloads, (c) => c.downloadscheduleID.eq(id)).subscribe((data) => {
      setDownloads(data.items)
    })
    return () => {
      downloadSub.unsubscribe()
    }
  }, [params])

  useEffect(() => {
    setDisabled(deepEqual(downloadSchedule, edited))
  }, [downloadSchedule, edited])

  useEffect(() => {
    setEdited(downloadSchedule)
  }, [downloadSchedule])

  async function saveEdits() {
    const newSchedule = await DataStore.save(edited)
    setDownloadSchedule(newSchedule)
  }

  async function deleteScheduledDownload() {
    await DataStore.delete(edited)
    navigate("/schedule/")
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Typography variant="h2" sx={{ flexGrow: 1 }}>
          Scheduled Download
        </Typography>
      </div>
      <DownloadScheduleForm schedule={edited} setSchedule={setEdited} />
      <div style={{ padding: "1rem", width: "100%", display: "flex", flexDirection: "row", gap: "1rem" }}>
        <div style={{ flexGrow: 1 }} />
        <Dialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
        >
          <DialogTitle>Delete Scheduled Download?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Deletion will permanently erase any configuration, and all download history.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => setShowDialog(false)}>
              Dismiss
            </Button>
            <Button variant="contained" onClick={deleteScheduledDownload}>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
        <Button onClick={() => setShowDialog(true)}>
          Delete
        </Button>
        <Button
          disabled={disabled}
          sx={{ justifySelf: "flex-end" }}
          variant="contained"
          onClick={saveEdits}
        >
          Save
        </Button>
      </div>

      <div style={{ display: "flex", flexDirection: "row", marginTop: "1rem", marginBottom: "1rem" }}>
        <Typography sx={{ flexGrow: 1 }} variant="h2">Download Jobs</Typography>
        <Button
          variant="outlined"
          onClick={() => {
            DataStore.save(new Downloads({
              downloadscheduleID: downloadSchedule?.id ?? "",
            }))
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
