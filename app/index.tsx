import { StrictMode, useEffect, useMemo, useState } from "react";
import ReactDomClient from "react-dom/client";
import "./index.css";
import MapCreator, { mapCreatorAction } from "./routes/maps/create";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import Root from "./routes/root";

import { RequireAuth } from "./RequireAuth";
import MapDlConfigTable, { dlConfigLoader, dlConfigAction } from "./routes/maps/dl/config";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ColorModeContext } from "./context";

import SignUp, { signUpAction } from "./routes/signup";
import SignIn, { signInAction } from './routes/signin'
import Forgot, { sendResetEmailAction } from "./routes/forgot";
import SignOut from "./routes/signout";
import UpdateMapDlConfig, { updateMapDlConfigAction, updateMapDlConfigLoader } from "./routes/maps/dl/config/update";
import AddLayerToMap from "./routes/maps/create/layers/add";
import { Flowbite } from "flowbite-react";


const rootEl = document.getElementById("root");

if (!rootEl) {
  throw new Error("yo something's messed up");
}
const root = ReactDomClient.createRoot(rootEl);


const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Navigate to="/maps/create" />,
        action: mapCreatorAction,
        errorElement: <ErrorPage />,

      },
      {
        path: "/maps/create",
        element: <MapCreator />,
        action: mapCreatorAction,
        errorElement: <ErrorPage />,
        children: [
          {
            path: "/maps/create/layers/add",
            element: <AddLayerToMap />
          }
        ]
      },
      {
        path: "/maps/dl/config",
        errorElement: <ErrorPage />,
        loader: dlConfigLoader,
        action: dlConfigAction,
        element: (
          <RequireAuth>
            <MapDlConfigTable />
          </RequireAuth>
        ),
        children: [
          {
            path: "/maps/dl/config/:id",
            loader: updateMapDlConfigLoader,
            action: updateMapDlConfigAction,
            element: (
              <UpdateMapDlConfig />
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
    <div>
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
