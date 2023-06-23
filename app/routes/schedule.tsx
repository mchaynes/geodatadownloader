import { Breadcrumbs, Button, Divider, Link, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import Container from "@mui/material/Container";
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
    <Container maxWidth="xl" sx={{ flexDirection: "column", maxHeight: "100vh" }}>
      <Container maxWidth="xl" style={{ flexDirection: "row" }}>
        <Breadcrumbs sx={{ flexGrow: 1 }}>
          {function() {
            const split = location.pathname.split("/")
            return [
              <Typography variant="h6" sx={{ flexGrow: 1 }}>Scheduled Downloads</Typography>,
              <>{split[2]}</>
            ]
          }()}
        </Breadcrumbs>
        <Button
          onClick={() => navigate("new")}
          variant="contained"
          sx={{ justifySelf: "flex-end", height: "75%", fontWeight: "600" }}
        >
          New
        </Button>
      </Container>
      <div style={{ display: "flex", marginTop: "1rem", flexDirection: "row", gap: "1rem" }}>
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
        <Divider orientation="vertical" flexItem={true} />
        <Container sx={{ maxHeight: "80vh", overflow: "auto" }}>
          <Outlet />
        </Container>
      </div>
    </Container>
  )
}
