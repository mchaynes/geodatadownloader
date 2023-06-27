import 'flowbite';
import { forwardRef, StrictMode, useEffect, useMemo, useState } from "react";
import ReactDomClient from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import Root from "./routes/root";

import CreateDownloadSchedule, { action as createDownloadScheduleAction } from "./routes/schedule/new";
import { RequireAuth } from "./RequireAuth";
import ScheduleTable, { loader as scheduleLoader } from "./routes/schedule";
import ViewScheduledDownload, { loader as viewLoader, action as viewAction } from "./routes/schedule/view";
import { responsiveFontSizes, createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import cyan from "@mui/material/colors/cyan";
import green from "@mui/material/colors/green";
import { ColorModeContext } from "./context";

import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import { LinkProps } from '@mui/material/Link';
import SignUp, { signUpAction } from "./routes/signup";
import SignIn, { signInAction } from './routes/signin'
import Forgot, { sendResetEmailAction } from "./routes/forgot";
import SignOut from "./routes/signout";
import { Flowbite } from 'flowbite-react';


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
        path: "/scheduled/",
        loader: scheduleLoader,
        element: (
          <RequireAuth>
            <ScheduleTable />
          </RequireAuth>
        ),
        children: [
          {
            path: "new",
            action: createDownloadScheduleAction,
            element: (
              <RequireAuth>
                <CreateDownloadSchedule />
              </RequireAuth>
            )
          },
          {
            path: ":id",
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
    element: <SignIn />,
    action: signInAction,
  },
  {
    path: "/signup",
    element: <SignUp />,
    action: signUpAction,
  },
  {
    path: "/forgot",
    element: <Forgot />,
    action: sendResetEmailAction,
  },
  {
    path: "/signout",
    element: <SignOut />,
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

  return (
    <div className="bg-gray-50 dark:bg-gray-800">
      <Flowbite>
        <ColorModeContext.Provider value={colorMode}>
          <RouterProvider router={router} />
        </ColorModeContext.Provider>
      </Flowbite>
    </div>
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
