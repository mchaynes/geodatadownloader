import { StrictMode, useEffect, useMemo, useState } from "react";
import ReactDomClient from "react-dom/client";
import "./index.css";
import MapCreator, { mapCreatorAction, mapCreatorLoader } from "./routes/maps/create";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import Root from "./routes/root";

import { RequireAuth } from "./RequireAuth";
import MapDlConfigTable, { dlConfigLoader, dlConfigAction } from "./routes/maps/dl/config";

import SignUp, { signUpAction } from "./routes/signup";
import SignIn, { signInAction } from './routes/signin'
import Forgot, { sendResetEmailAction } from "./routes/forgot";
import { signoutAction } from "./routes/signout";
import UpdateMapDlConfig, { updateMapDlConfigAction, updateMapDlConfigLoader } from "./routes/maps/dl/config/update";
import AddLayerToMap from "./routes/maps/create/layers/add";
import { Flowbite } from "flowbite-react";
import { removeLayerAction } from "./routes/maps/create/remove-layer";
import { getQueryResultsLoader } from "./routes/maps/create/layers/results";
import { ExtentPicker, extentPickerAction } from "./ExtentPicker";
import { configureLayerAction } from "./routes/maps/create/layers/configure";


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
        loader: mapCreatorLoader,
        errorElement: <ErrorPage />,
        children: [
          {
            path: "/maps/create",
            loader: mapCreatorLoader,
            action: mapCreatorAction,
            element: <ExtentPicker />
          },
          {
            path: "/maps/create/boundary",
            action: extentPickerAction,
          },
          {
            path: "/maps/create/layers/add",
            element: <AddLayerToMap />
          },
          {
            path: "/maps/create/remove-layer",
            action: removeLayerAction,
          },
          {
            path: "/maps/create/layers/results",
            loader: getQueryResultsLoader,
          },
          {
            path: "/maps/create/layers/configure",
            action: configureLayerAction,
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
    action: signoutAction,
  }
])


export default function WithStyles() {

  return (
    <div>
      <Flowbite>
        <RouterProvider router={router} />
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
