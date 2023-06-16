import { graphqlOperation, GraphQLQuery } from "@aws-amplify/api";
import { Button, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { DataGrid, GridRenderCellParams } from "@mui/x-data-grid";
import { GridColDef } from "@mui/x-data-grid/models/colDef";
import { API } from "aws-amplify";
import { useLoaderData, useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { ListDownloadSchedulesQuery } from "../API";
import { listDownloadSchedules } from "../graphql/queries";


export async function loader() {
  const result = await API.graphql<GraphQLQuery<ListDownloadSchedulesQuery>>(graphqlOperation(listDownloadSchedules))
  return result.data?.listDownloadSchedules?.items
}

export default function ScheduleTable() {

  const scheduledDownloads = useLoaderData() as Awaited<ReturnType<typeof loader>>
  const navigate = useNavigate()

  const headers = Object.entries({
    "job_name": {
      name: "Job Name",
      width: 200,
    },
    "layer_url": { name: "Layer URL", width: 200 },
    "format": { name: "Format", width: 75 },
    "destination": { name: "Destination", width: 75 },
    "frequency": { name: "Frequency", width: 75 },
    "start_at": { name: "Start At", width: 75 },
    "column_mapping": { name: "Column Mapping", width: 75 },
  })
  const gridColDefs: GridColDef[] = []
  for (const [id, c] of headers) {
    gridColDefs.push({
      field: id,
      renderCell: (f) => {
        if (id === "job_name") {
          // If we're rendering the job name, render a Link to the details of the job so we can update it
          return (<Link to={`${f.row["id"]}/edit`}>{f.value}</Link>)

        }
        return f.value
      },
      headerName: c.name,
      width: c.width,
    })
  }

  return (
    <Container sx={{ marginTop: "1rem", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Typography variant="h2" sx={{ flexGrow: 1 }}>Scheduled Downloads</Typography>
        <Button
          onClick={() => navigate("new")}
          variant="contained"
          sx={{ justifySelf: "flex-end", height: "75%", fontWeight: "600" }}
        >
          New
        </Button>
      </div>
      <Box sx={{ height: "40rem", width: "100%" }}>
        <DataGrid
          rows={scheduledDownloads ? scheduledDownloads : []}
          columns={gridColDefs}
        />
      </Box>
    </Container>
  )
}
