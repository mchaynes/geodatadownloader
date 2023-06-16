import { Typography } from "@mui/material";
import CreateScheduledDownload from "../../ui-components/CreateScheduledDownload";

export default function CreateDownloadSchedule() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Typography variant="h2">
        Create Scheduled Download
      </Typography>
      <CreateScheduledDownload />
    </div>
  )
}
