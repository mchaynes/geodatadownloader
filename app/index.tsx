import { StrictMode } from "react";
import ReactDomClient from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import Root from "./routes/root";

import '@aws-amplify/ui-react/styles.css';
import CreateDownloadSchedule, { action as createDownloadScheduleAction } from "./routes/schedule/new";
import Login from "./routes/login";
import awsExports from './aws-exports'
import { Amplify, DataStore, Hub } from "aws-amplify";
import { RequireAuth } from "./RequireAuth";
import { Authenticator } from "@aws-amplify/ui-react";
import ScheduleTable, { loader as scheduleLoader } from "./routes/schedule";
import ViewScheduledDownload, { loader as viewLoader, action as viewAction } from "./routes/schedule/view";


const rootEl = document.getElementById("root");

if (!rootEl) {
  throw new Error("yo something's messed up");
}
const root = ReactDomClient.createRoot(rootEl);
Amplify.configure(awsExports)
// clear the data store when signing out. We don't want to cross contaminate data between accounts
Hub.listen('auth', async (data) => {
  if (data.payload.event === "signOut") {
    await DataStore.clear()
  }
})

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

      {
        path: "/login",
        element: <Login />
      }
    ]
  }
])

root.render(
  <StrictMode>
    <Authenticator.Provider>
      <RouterProvider router={router} />
    </Authenticator.Provider>
  </StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
