import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CreateScheduledDownload from "../../ui-components/CreateScheduledDownload";

export default function CreateDownloadSchedule() {
  const navigate = useNavigate()
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Typography variant="h2">
        Create Scheduled Download
      </Typography>
      <CreateScheduledDownload onSuccess={() => navigate(`/schedule/`)} />
    </div>
  )
}
