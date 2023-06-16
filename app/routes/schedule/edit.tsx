import { graphqlOperation, GraphQLQuery } from "@aws-amplify/api";
import { Typography } from "@mui/material";
import { API, DataStore } from "aws-amplify";
import { useLoaderData } from "react-router-dom";
import { GetDownloadScheduleQuery } from "../../API";
import { getDownloadSchedule } from "../../graphql/queries";
import { DownloadSchedule } from "../../models";
import UpdateScheduledDownload from "../../ui-components/UpdateScheduledDownload";


export async function loader({ params }) {
  const schedule = await DataStore.query(DownloadSchedule, params.id)
  return schedule
}

export default function UpdateDownloadSchedule() {
  const downloadSchedule = useLoaderData() as Awaited<ReturnType<typeof loader>>

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Typography variant="h2">
        Update Scheduled Download
      </Typography>
      <UpdateScheduledDownload downloadSchedule={downloadSchedule ?? undefined} />
    </div>
  )
}
