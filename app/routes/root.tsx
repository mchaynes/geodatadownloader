import { cyan } from "@mui/material/colors";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import logo from "/IMG_1039.png";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import { supabase } from "../supabase";
import { User } from "@supabase/supabase-js";
import PopupState, { bindPopover, bindTrigger } from "material-ui-popup-state";
import { Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Popover, Tooltip, useTheme } from "@mui/material";
import { AccountCircle, Download, EventRepeat } from "@mui/icons-material";

export default function Root() {
  const navigate = useNavigate()
  const theme = useTheme()
  const location = useLocation()
  const [user1, setUser] = useState<User>()
  const signoutAndRedirect = async () => {
    await supabase.auth.signOut()
    navigate("/signin")
  }

  useEffect(() => {
    async function f() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      }
    }
    void f()
  }, [location])
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "1rem",
      }}
    >
      <CssBaseline />
      <div style={{ display: "flex", flexDirection: "row", width: "100%", gap: "1rem" }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          borderRight: "1px",
          alignItems: "center",
          borderRightWidth: "1px",
          borderRightStyle: "solid",
          paddingRight: "1rem",
          borderRightColor: theme.palette.divider,
        }}>
          <Link to="/">
            <img
              src={logo as string}
              width="36px"
              height="36px"
              alt="Geodatadownloader Logo"
            />
          </Link>
          <Divider flexItem={true} />
          <Tooltip title="Download Data" placement="right-end" >
            <IconButton>
              <Link to="/">
                <Download color="action" />
              </Link>
            </IconButton>
          </Tooltip>
          <Tooltip title="Scheduled Downloads" placement="right-end">
            <IconButton>
              <Link to="/schedule/new">
                <EventRepeat color="action" />
              </Link>
            </IconButton>
          </Tooltip>
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "row", alignContent: "flex-start" }}>
            <Typography variant="h1" color="inherit" noWrap={true}>
              geodatadownloader
            </Typography>
            <PopupState variant="popover">
              {(popupState) => (
                <>
                  <IconButton {...bindTrigger(popupState)} >
                    {user1 === undefined ?
                      <Avatar sx={{ bgcolor: cyan.A700, color: "white" }} />
                      :
                      <Avatar
                        sx={{ bgcolor: cyan.A700, color: "white" }}
                      >
                        <strong>{user1.email?.substr(0, 2) ?? "na"}</strong>
                      </Avatar>
                    }
                  </IconButton>
                  <Popover
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    {...bindPopover(popupState)}
                  >
                    {
                      <List>
                        {user1 === undefined ?
                          <ListItemButton onClick={() => navigate("/signin")}>
                            <ListItemIcon>
                              <AccountCircle />
                            </ListItemIcon>
                            <ListItemText primary="Login" />
                          </ListItemButton>
                          :
                          <ListItemButton onClick={signoutAndRedirect}>
                            <ListItemIcon>
                              <AccountCircle />
                            </ListItemIcon>
                            <ListItemText primary="Logout" />
                          </ListItemButton>
                        }
                      </List>
                    }
                  </Popover>
                </>
              )}

            </PopupState>
          </div>
          <div style={{ width: "100%", alignSelf: "flex-start" }}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

