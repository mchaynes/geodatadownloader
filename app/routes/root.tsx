import { cyan, green } from "@mui/material/colors";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme } from "@mui/material/styles";
import responsiveFontSizes from "@mui/material/styles/responsiveFontSizes";
import { ThemeProvider } from "@emotion/react";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import React, { useMemo } from "react";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ColorModeContext } from "../context";

import logo from "/IMG_1039.png";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";

function Root() {
  const navigate = useNavigate()
  const { user, signOut } = useAuthenticator(ctx => [ctx.user])
  const signoutAndRedirect = () => {
    signOut()
    navigate("/login")
  }
  return (
    <Container
      maxWidth={false}
      sx={{
        display: "flex",
        flexDirection: "column",
        borderLeft: "20rem",
        borderRight: "10rem",
        paddingTop: "1rem",
        paddingBottom: "2rem",
      }}
    >
      <CssBaseline />
      <div style={{ display: "flex", flexDirection: "row" }}>
        <img
          src={logo as string}
          width="48px"
          height="48px"
          alt="Geodatadownloader Logo"
          onClick={() => navigate("/")}
        />
        <Typography sx={{ ml: 3 }} variant="h1" color="inherit" noWrap={true}>
          geodatadownloader
        </Typography>
        {user === undefined ?
          <IconButton onClick={() => navigate("/login")} >
            <Chip
              label="Sign in"
              avatar={<Avatar sx={{ bgcolor: cyan.A700, color: "white" }} />}
            />
          </IconButton>
          :
          <IconButton onClick={signoutAndRedirect} >
            <Chip
              label="Sign out"
              avatar={
                <Avatar
                  sx={{ bgcolor: cyan.A700, color: "white" }}
                >
                  <strong>{user.attributes?.email.substr(0, 2).toUpperCase()}</strong>
                </Avatar>}
            />
          </IconButton>

        }

      </div>
      <Outlet />
    </Container>
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
