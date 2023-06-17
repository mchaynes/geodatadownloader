import { DataStore } from "@aws-amplify/datastore";
import { isAWSTime } from "@aws-amplify/datastore/lib-esm/util";
import { Autocomplete, Button, Checkbox, FormControlLabel, FormGroup, Switch, TextField, Typography } from "@mui/material";
import { LocalizationProvider, TimeField, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from "dayjs";
import { ChangeEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import DownloadScheduleForm from "../../DownloadScheduleForm";
import { Days, DownloadSchedule, Formats, Frequency } from "../../models";


function convertToTitleCase(str: string): string {
  const lowerCaseStr = str.toLowerCase();
  const convertedStr = lowerCaseStr.charAt(0).toUpperCase() + lowerCaseStr.slice(1);
  return convertedStr;
}

export default function CreateDownloadSchedule() {
  const [edited, setEdited] = useState(new DownloadSchedule({
    layer_url: "",
    frequency: Frequency.DAILY,
    format: Formats.GPKG,
    access_key_id: "",
    secret_key: "",
    days_of_the_week: [],
  }))
  const [messages, setMessages] = useState<JSX.Element[]>([])

  async function create() {
    const { id, job_name } = await DataStore.save(edited)
    setMessages([
      <>Created scheduled download <Link to={`/schedule/${id}`}>{job_name}</Link></>,
      ...messages,
    ])
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "10rem" }}>
      <Typography variant="h2">
        Create Scheduled Download
      </Typography>
      <DownloadScheduleForm schedule={edited} setSchedule={setEdited} />
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ flexGrow: 1 }} />
        <Button variant="contained" onClick={create}>Create</Button>
      </div>
    </div>
  )
}
