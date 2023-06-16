import { Autocomplete, Button, Dialog, DialogActions, DialogTitle, TextField, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { DataStore } from "aws-amplify";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Downloads, DownloadSchedule, Formats, Frequency } from "../../models";

const passwordAttrs = [
  "access_key_id",
  "secret_key"
]

const ignoredFields = [
  "createdAt",
  "updatedAt",
  "owner",
  "id"
]

const selectorFields = {
  "frequency": Frequency,
  "format": Formats,
}

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
        <DialogTitle>Confirm Deletion of job</DialogTitle>
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

export default function ViewScheduledDownload() {
  const [downloadSchedule, setDownloadSchedule] = useState<DownloadSchedule>(new DownloadSchedule({}))
  const [edited, setEdited] = useState<DownloadSchedule>(new DownloadSchedule({}))
  const [downloads, setDownloads] = useState<Downloads[]>([])
  const params = useParams()
  const navigate = useNavigate()
  useEffect(() => {
    const { id } = params
    if (!id) {
      throw new Error(`id is not set`)
    }
    DataStore.query(DownloadSchedule, id).then(val => {
      if (val) {
        setDownloadSchedule(val)
      }
    })
    const downloadSub = DataStore.observeQuery(Downloads, (c) => c.downloadscheduleID.eq(id)).subscribe((data) => {
      setDownloads(data.items)
    })
    return () => {
      downloadSub.unsubscribe()
    }
  }, [params])

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
      <DataGrid
        components={{
          Footer: Footer,
        }}
        componentsProps={{
          footer: {
            onSave: saveEdits,
            onDelete: () => DataStore.delete(edited),
            disabled: deepEqual(downloadSchedule, edited)
          }
        }}
        columns={[
          {
            field: 'attribute',
            headerName: "Attribute",
            flex: 1,
          },
          {
            field: 'value',
            headerName: 'Value (double click to edit)',
            flex: 3,
            editable: true,
            sortable: false,
            renderCell: (row) => {
              const rowId = row.id.toString()
              if (passwordAttrs.includes(rowId)) {
                return "*".repeat(20)
              }
              return edited[rowId]
            },
            renderEditCell: row => {
              const rowId = row.id.toString()
              let val = edited[rowId]
              if (passwordAttrs.includes(rowId)) {
                val = ""
              }
              // add selector for frequency
              if (rowId in selectorFields) {
                return <Autocomplete
                  value={val}
                  options={Object.values(selectorFields[rowId])}
                  sx={{ width: "100%" }}
                  renderInput={(params) => <TextField {...params} label={rowId} />}
                  onChange={(_, newVal) => {
                    setEdited(DownloadSchedule.copyOf(edited, draft => {
                      draft[rowId] = newVal
                    }))
                  }}
                />
              }
              return <TextField
                value={val}
                sx={{ width: "100%" }}
                onChange={(evt) => {
                  setEdited(DownloadSchedule.copyOf(edited, draft => {
                    draft[rowId] = evt.target.value
                  }))
                }}
              />
            }
          }
        ]}
        rows={Object.entries(edited ?? {})
          .filter(([attr]) => !attr.startsWith("_"))
          .filter(([attr]) => !ignoredFields.includes(attr))
          .map(([attr, val]) => ({
            id: `${attr}`,
            attribute: attr,
            value: val,
          }))}
        autoHeight={true}
        sortModel={undefined}
      />
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
      <DataGrid columns={[
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
        autoHeight={true}
      />
    </div>
  )
}
