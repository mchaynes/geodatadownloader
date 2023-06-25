import { forwardRef, StrictMode, useEffect, useMemo, useState } from "react";
import ReactDomClient from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import Root from "./routes/root";

import CreateDownloadSchedule, { action as createDownloadScheduleAction } from "./routes/schedule/new";
import SignIn from "./routes/signin";
import { RequireAuth } from "./RequireAuth";
import ScheduleTable, { loader as scheduleLoader } from "./routes/schedule";
import ViewScheduledDownload, { loader as viewLoader, action as viewAction } from "./routes/schedule/view";
import { responsiveFontSizes, createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import cyan from "@mui/material/colors/cyan";
import green from "@mui/material/colors/green";
import { ColorModeContext } from "./context";
import { CssBaseline } from "@mui/material";

import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import { LinkProps } from '@mui/material/Link';
import SignUp from "./routes/signup";
import Forgot from "./routes/forgot";


const rootEl = document.getElementById("root");

if (!rootEl) {
  throw new Error("yo something's messed up");
}
const root = ReactDomClient.createRoot(rootEl);


const LinkBehavior = forwardRef<
  HTMLAnchorElement,
  Omit<RouterLinkProps, 'to'> & { href: RouterLinkProps['to'] }
>((props, ref) => {
  const { href, ...other } = props;
  // Map href (Material UI) -> to (react-router)
  return <RouterLink ref={ref} to={href} {...other} />;
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/schedule/",
        loader: scheduleLoader,
        element: (
          <RequireAuth>
            <ScheduleTable />
          </RequireAuth>
        ),
        children: [
          {
            path: "/schedule/new/",
            action: createDownloadScheduleAction,
            element: (
              <RequireAuth>
                <CreateDownloadSchedule />
              </RequireAuth>
            )
          },
          {
            path: "/schedule/:id/",
            loader: viewLoader,
            action: viewAction,
            element: (
              <RequireAuth>
                <ViewScheduledDownload />
              </RequireAuth>
            )
          },
        ]
      },
    ]
  },
  {
    path: "/signin",
    element: <SignIn />
  },
  {
    path: "/signup",
    element: <SignUp />
  },
  {
    path: "/forgot",
    element: <Forgot />
  }
])


export default function WithStyles() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = useState<"light" | "dark">("light");

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

  const theme = useMemo(() => {
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
          },
          MuiLink: {
            defaultProps: {
              component: LinkBehavior,
            } as LinkProps,
            styleOverrides: {
              root: {
                color: "black",
                textDecorationColor: "black",
              }
            }
          },
          MuiButtonBase: {
            defaultProps: {
              LinkComponent: LinkBehavior,
            }
          }
        },
      })
    );
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ColorModeContext.Provider value={colorMode}>
        <RouterProvider router={router} />
      </ColorModeContext.Provider>
    </ThemeProvider>
  );
}

root.render(
  <StrictMode>
    <WithStyles />
  </StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
