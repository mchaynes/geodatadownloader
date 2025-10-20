import { StrictMode } from "react";
import ReactDomClient from "react-dom/client";
import "./index.css";
import MapCreator, { mapCreatorAction, mapCreatorLoader } from "./routes/maps/create";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import Root from "./routes/root";


import Forgot, { sendResetEmailAction } from "./routes/forgot";
import AddLayerToMap from "./routes/maps/create/layers/add";
import { Flowbite } from "flowbite-react";
import type { CustomFlowbiteTheme } from "flowbite-react";
import { removeLayerAction } from "./routes/maps/create/remove-layer";
import { getQueryResultsLoader } from "./routes/maps/create/layers/results";
import { ExtentPicker, extentPickerAction } from "./ExtentPicker";
import ConfigureLayerModal from "./routes/maps/create/layers/configure";
import WFSDownloader from "./routes/wfs-download";


const rootEl = document.getElementById("root");

if (!rootEl) {
  throw new Error("yo something's messed up");
}
const root = ReactDomClient.createRoot(rootEl);


import Hotjar from '@hotjar/browser';



const siteId = 3816062;
const hotjarVersion = 6;

Hotjar.init(siteId, hotjarVersion);


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
        path: "/wfs",
        element: <WFSDownloader />,
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
            element: <ConfigureLayerModal open={true} />,
          }
        ]
      },
    ]
  },
])

// Custom theme to fix button visibility in light mode
const customTheme: CustomFlowbiteTheme = {
  button: {
    color: {
      failure: "text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
    }
  }
};

export default function WithStyles() {

  return (
    <div>
      <Flowbite theme={{ theme: customTheme }}>
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
