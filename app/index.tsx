import { StrictMode } from "react";
import ReactDomClient from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./ErrorPage";
import Root from "./routes/root";

import '@aws-amplify/ui-react/styles.css';
import CreateDownloadSchedule from "./routes/schedule/new";
import Login from "./routes/login";
import awsExports from './aws-exports'
import { Amplify } from "aws-amplify";
import { RequireAuth } from "./RequireAuth";
import { Authenticator } from "@aws-amplify/ui-react";
import ScheduleTable, { loader as scheduleLoader } from "./routes/schedule";
import UpdateDownloadSchedule, { loader as updateScheduleLoader } from "./routes/schedule/edit";


const rootEl = document.getElementById("root");

if (!rootEl) {
  throw new Error("yo something's messed up");
}
const root = ReactDomClient.createRoot(rootEl);
Amplify.configure(awsExports)

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
      },
      {
        path: "/schedule/new/",
        element: (
          <RequireAuth>
            <CreateDownloadSchedule />
          </RequireAuth>
        )
      },
      {
        path: "/schedule/:id/edit",
        loader: updateScheduleLoader,
        element: (
          <RequireAuth>
            <UpdateDownloadSchedule />
          </RequireAuth>
        )
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
