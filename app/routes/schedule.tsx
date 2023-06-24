import { Breadcrumbs, Button, Divider, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { Outlet, useLoaderData, useLocation, useNavigate } from "react-router";
import { supabase } from "../supabase";


export const loader = async () => {
  const { data, error } = await supabase.from("scheduled_downloads").select()
  if (error) {
    throw new Error(JSON.stringify(error))
  }
  return data
}

export default function ScheduleTable() {

  const scheduled = useLoaderData() as Awaited<ReturnType<typeof loader>>

  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div style={{ flexDirection: "column", maxHeight: "100vh" }}>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Breadcrumbs sx={{ ml: 3, flexGrow: 1 }}>
          {function() {
            const split = location.pathname.split("/")
            return [
              <Typography variant="h6" sx={{ flexGrow: 1 }}>Scheduled Downloads</Typography>,
              <>{split[2]}</>
            ]
          }()}
        </Breadcrumbs>
      </div>
      <div style={{ display: "flex", marginTop: "1rem", flexDirection: "row", gap: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "row", justifyItems: "flex-end" }}>
            <div style={{ flexGrow: 1 }} />
            <Button variant="outlined">
              Create
            </Button>
          </div>
          <List sx={{ overflowY: "auto", height: "80vh" }}>
            {scheduled && scheduled.length > 0 ?
              scheduled.map((s) =>
                <ListItemButton
                  key={s.id}
                  onClick={() => navigate(s.id)}
                  selected={location.pathname.includes(s.id)}
                >
                  <ListItemText primary={s.name} secondary={<>{s.frequency} &#x2022; {s.format}</>} />
                </ListItemButton>
              )
              : <ListItemText primary="No scheduled downloads have been created" />
            }
          </List>
        </div>

        <Divider orientation="vertical" flexItem={true} />
        <div style={{ maxHeight: "80vh", width: "100%", overflow: "auto" }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
