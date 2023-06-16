import { Skeleton, Typography } from "@mui/material";
import { DataStore } from "aws-amplify";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DownloadSchedule } from "../../models";
import UpdateScheduledDownload from "../../ui-components/UpdateScheduledDownload";


export default function UpdateDownloadSchedule() {
  const [downloadSchedule, setDownloadSchedule] = useState<DownloadSchedule>()
  const params = useParams()
  useEffect(() => {
    const { id } = params
    if (!id) {
      throw new Error(`id is not set`)
    }
    DataStore.query(DownloadSchedule, id).then(setDownloadSchedule)
  }, [params])
  const navigate = useNavigate()

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Typography variant="h2">
        Update Scheduled Download
      </Typography>
      {downloadSchedule ? (
        <UpdateScheduledDownload
          downloadSchedule={downloadSchedule}
          onSuccess={(vals) => {
            navigate(`/schedule/${downloadSchedule?.id}`)
            return vals
          }}
        />
      ) : <Skeleton />}

    </div>
  )
}
