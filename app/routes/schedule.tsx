import { Button, Link, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { DataGrid } from "@mui/x-data-grid";
import { GridColDef } from "@mui/x-data-grid/models/colDef";
import { LoaderFunction, useLoaderData, useNavigate } from "react-router";
import { supabase } from "../supabase";
import { ScheduledDownload } from "../types";


export const loader: LoaderFunction = async () => {
  const { data, error } = await supabase.from("scheduled_downloads").select()
  if (error) {
    throw new Error(JSON.stringify(error))
  }
  return data
}

export default function ScheduleTable() {

  const scheduled = useLoaderData() as ScheduledDownload[]

  const navigate = useNavigate()

  const headers = Object.entries({
    "name": {
      name: "Job Name",
      width: 200,
      flex: 2,
    },
    "layer_url": { name: "Layer URL", width: 100, flex: 1 },
    "format": { name: "Format", width: 75, flex: 1 },
    "destination": { name: "Destination", width: 75, flex: 1 },
    "frequency": { name: "Frequency", width: 75 },
    "column_mapping": { name: "Column Mapping", width: 75, flex: 2 },
  })
  const gridColDefs: GridColDef[] = []
  for (const [id, c] of headers) {
    gridColDefs.push({
      field: id,
      renderCell: (f) => {
        if (id === "name") {
          // If we're rendering the job name, render a Link to the details of the job so we can update it
          return (
            <Link href={`${f.row["id"]}`} onClick={() => navigate(`${f.row["id"]}`)}>
              {f.value}
            </Link>
          )

        }
        let val = f.value
        if (typeof f.value === "object") {
          val = JSON.stringify(f.value)
        }
        return <Typography>{val}</Typography>
      },
      headerName: c.name,
      width: c.width,
      flex: c.flex,
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
          rows={scheduled ? scheduled : []}
          columns={gridColDefs}
        />
      </Box>
    </Container>
  )
}
