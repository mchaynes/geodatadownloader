import { Button, Container, Table, TableBody, TableCell, TableRow, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import { DataStore } from "aws-amplify";
import { useEffect, useState } from "react";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import { Downloads, DownloadSchedule, DownloadStatus } from "../../models";


export default function ViewScheduledDownload() {
  const [downloadSchedule, setDownloadSchedule] = useState<DownloadSchedule>()
  const [downloads, setDownloads] = useState<Downloads[]>([])
  const params = useParams()
  useEffect(() => {
    const { id } = params
    if (!id) {
      throw new Error(`id is not set`)
    }
    DataStore.query(DownloadSchedule, id).then(setDownloadSchedule)
    const downloadSub = DataStore.observeQuery(Downloads, (c) => c.downloadscheduleID.eq(id)).subscribe((data) => {
      setDownloads(data.items)
    })
    console.log("View finished running useEffect")
    return () => {
      downloadSub.unsubscribe()
    }
  }, [params])

  const navigate = useNavigate()

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Typography variant="h2" sx={{ flexGrow: 1 }}>
          Scheduled Download
        </Typography>
        <Button
          sx={{ justifySelf: "flex-end" }}
          onClick={() => navigate("edit")}
          variant="outlined"
        >
          Edit
        </Button>
      </div>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell><Typography>Job Name</Typography></TableCell>
            <TableCell>{downloadSchedule?.job_name}</TableCell>
          </TableRow>

          <TableRow>
            <TableCell><Typography>ID</Typography></TableCell>
            <TableCell>{downloadSchedule?.id}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell><Typography>Layer URL</Typography></TableCell>
            <TableCell>{downloadSchedule?.layer_url}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell><Typography>Output Format</Typography></TableCell>
            <TableCell>{downloadSchedule?.format}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell><Typography>Destination</Typography></TableCell>
            <TableCell>{downloadSchedule?.destination}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell><Typography>Frequency</Typography></TableCell>
            <TableCell>{downloadSchedule?.frequency}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell><Typography>Column Mapping</Typography></TableCell>
            <TableCell>{JSON.stringify(downloadSchedule?.column_mapping)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div style={{ display: "flex", flexDirection: "row", marginTop: "1rem", marginBottom: "1rem" }}>
        <Typography sx={{ flexGrow: 1 }} variant="h2">Download Jobs</Typography>
        <Button
          variant="outlined"
          onClick={() => {
            DataStore.save(new Downloads({
              downloadscheduleID: downloadSchedule?.id ?? "",
              status: DownloadStatus.PENDING,
            }))
          }}
        >
          Start New Job
        </Button>
      </div>
      <Container sx={{ width: "100%" }}>
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
      </Container>


    </div>
  )
}
