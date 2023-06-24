import { cyan, green } from "@mui/material/colors";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme } from "@mui/material/styles";
import responsiveFontSizes from "@mui/material/styles/responsiveFontSizes";
import { ThemeProvider } from "@emotion/react";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import React, { useMemo, useState } from "react";
import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ColorModeContext } from "../context";

import logo from "/IMG_1039.png";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import { supabase } from "../supabase";
import { User } from "@supabase/supabase-js";
import PopupState, { bindPopover, bindTrigger } from "material-ui-popup-state";
import Button from "@mui/material/Button";
import { Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Popover, Tooltip, useTheme } from "@mui/material";
import { AccountCircle, Download, EventRepeat } from "@mui/icons-material";

function Root() {
  const navigate = useNavigate()
  const theme = useTheme()
  const location = useLocation()
  const [user1, setUser] = useState<User>()
  const signoutAndRedirect = async () => {
    await supabase.auth.signOut()
    navigate("/login")
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
                          <ListItemButton onClick={() => navigate("/login")}>
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
export default function WithStyles() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = React.useState<"light" | "dark">("light");

  const colorMode = useMemo(
    () => ({
      mode: mode,
      setColorMode: (colorMode: typeof mode) => {
        setMode(colorMode);
      },
    }),
    [mode]
  );
  useEffect(() => {
    colorMode.setColorMode(prefersDarkMode ? "dark" : "light");
  }, [prefersDarkMode, mode]);

  const theme = React.useMemo(() => {
    return responsiveFontSizes(
      createTheme({
        palette: {
          mode: mode,
          ...(mode === "light"
            ? {
              primary: {
                main: cyan.A700,
              },
              success: {
                light: green.A700,
                main: green.A700,
                dark: green[900],
              },
            }
            : {
              primary: {
                main: cyan.A400,
              },
              success: {
                light: green.A700,
                main: green.A700,
                dark: green[900],
              },
            }),
        },
        typography: {
          fontFamily: [
            "Roboto",
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            '"Helvetica Neue"',
            "Arial",
            "sans-serif",
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
          ].join(" "),
          fontWeightRegular: 300,
          fontWeightLight: 200,
          fontWeightMedium: 350,
          fontWeightBold: 400,
          fontSize: 14,
          h1: {
            fontSize: "1.9rem",
            flexGrow: 1,
          },
          h2: {
            alignSelf: "flex-start",
            fontSize: "2rem",
            fontWeight: 400,
            marginBottom: "1rem",
          },
          h3: {
            fontSize: "1.25rem",
            marginBottom: "0.75rem",
          },
          body1: {
            fontSize: "1.0rem",
          },
          body2: {
            fontSize: "0.9rem",
          },
          caption: {
            fontSize: "0.7rem",
            paddingTop: "0.5rem",
            paddingBottom: "0.5rem",
            paddingRight: "1rem",
            display: "flex",
            justifyContent: "flex-end",
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                fontWeight: 900,
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              sizeSmall: {
                fontSize: "0.8rem",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              outlined: {
                display: "flex",
                flexDirection: "column",
                gap: "1rem 1rem",
                alignItems: "stretch",
                paddingTop: "1rem",
                paddingLeft: "3rem",
                paddingRight: "3rem",
                paddingBottom: "1rem",
              },
            },
          },
          MuiAlert: {
            styleOverrides: {
              standardSuccess: {
                justifySelf: "flex-end",
                fontWeight: 600,
              },
              standardInfo: {
                justifySelf: "flex-end",
                fontWeight: 600,
              },
            },
          },
          MuiDivider: {
            styleOverrides: {
              root: {
                paddingTop: "2rem",
                paddingBottom: "1rem",
              },
            },
          },
          MuiContainer: {
            styleOverrides: {
              root: {
                display: "flex",
                flexDirection: "row",
                gap: ".5rem .5rem",
              },
            },
          },
          MuiListItemText: {
            styleOverrides: {
              secondary: {
                fontWeight: 200,
              }
            }
          }
        },
      })
    );
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <ColorModeContext.Provider value={colorMode}>
        <Root />
      </ColorModeContext.Provider>
    </ThemeProvider>
  );
}
