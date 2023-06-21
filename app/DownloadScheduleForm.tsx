import { Autocomplete, Checkbox, FormControl, FormControlLabel, FormGroup, InputLabel, MenuItem, Select, Switch, TextField, Typography } from "@mui/material";
import { LocalizationProvider, TimeField } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Day, Days, Formats, Frequencies, Frequency, ScheduledDownload, ScheduledDownloadInsert } from "./types";


function convertToTitleCase(str: string): string {
  const lowerCaseStr = str.toLowerCase();
  const convertedStr = lowerCaseStr.charAt(0).toUpperCase() + lowerCaseStr.slice(1);
  return convertedStr;
}

export type DownloadScheduleFormProps = {
  schedule?: ScheduledDownloadInsert
}

export default function DownloadScheduleForm({ schedule }: DownloadScheduleFormProps) {
  const [frequency, setFrequency] = useState<Frequency>(schedule?.frequency ?? "weekly")
  const [days, setDays] = useState<Day[]>(schedule?.days_of_week ?? [])
  const bindField = (field: keyof ScheduledDownload) => ({
    defaultValue: schedule ? schedule[field] : undefined,
    name: field,
    key: `${schedule?.id}-${field}`,
    fullWidth: true,
  })

  const handleDayChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.checked) {
      setDays([...new Set([e.target.name as Day, ...days])])
    } else {
      setDays(days.filter(d => d !== e.target.name))
    }
  }


  useEffect(() => {
    if (schedule) {
      setFrequency(schedule.frequency ?? "monthly")
    }
  }, [schedule])
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", gap: "2rem" }}>
        <TextField
          label={"Job Name"}
          sx={{ justifySelf: "flex-start", flexGrow: 1 }}
          placeholder={"King County Wetlands - Daily"}
          required={true}
          {...bindField("name")}
        />
        <FormGroup>
          <FormControlLabel
            sx={{ justifySelf: "flex-end", flexGrow: 1 }}
            control={
              <Switch
                name="active"
                {...(schedule?.active ? { defaultChecked: true } : undefined)}
              />
            }
            label="Active"
          />
        </FormGroup>
      </div>
      <TextField
        label={"Layer URL"}
        type="url"
        placeholder={"https://gismaps.kingcounty.gov/arcgis/rest/services/Environment/KingCo_SensitiveAreas/MapServer/11"}
        required={true}
        {...bindField("layer_url")}
      />
      <FormControl>
        <InputLabel>Output Format</InputLabel>
        <Select
          required={true}
          label="Output Format"
          {...bindField("format")}
        >
          {Formats.map(f =>
            <MenuItem key={f} value={f}>{f}</MenuItem>
          )}
        </Select>
      </FormControl>

      <TextField
        label={"Where"}
        type="text"
        placeholder={"1=1"}
        {...bindField("where_clause")}
      />
      <TextField
        label={"Boundary"}
        type="text"
        placeholder={"Paste in JSON boundary"}
        {...bindField("boundary")}
        defaultValue={typeof schedule?.boundary === "object" ? JSON.stringify(schedule.boundary) : schedule?.boundary ?? ""}
      />
      <TextField
        label={"Destination (R2 or S3 endpoint)"}
        type="url"
        placeholder={"https://${ACCOUNT_ID}.r2.cloudflarestorage.com/bucket"}
        required={true}
        {...bindField("destination")}
      />
      <TextField
        label={"Access Key ID (R2 or S3)"}
        type="password"
        required={true}
        {...bindField("access_key_id")}
      />
      <TextField
        label={"Secret Key (R2 or S3)"}
        type="password"
        required={true}
        {...bindField("secret_key")}
      />
      <FormControl>
        <InputLabel>Download Frequency</InputLabel>
        <Select
          label={"Download Frequency"}
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as Frequency)}
        >
          {Frequencies.map(f =>
            <MenuItem key={f} value={f}>{f}</MenuItem>
          )}
        </Select>
      </FormControl>
      {frequency === "weekly" && (
        <FormGroup>
          <div style={{ display: "flex", flexDirection: "row" }}>
            {Days.map((day: Day) =>
              <FormControlLabel
                key={day}
                control={
                  <Checkbox
                    name={day}
                    checked={days.includes(day)}
                    onChange={handleDayChecked}
                  />
                }
                label={convertToTitleCase(day)}
              />
            )}
          </div>
        </FormGroup>
      )}
      {("monthly" == frequency) && (
        <TextField
          label={"Day of Month (1-31)"}
          type="number"
          {...bindField("day_of_month")}
        />
      )}
      {("daily" === frequency || "monthly" == frequency || "weekly" === frequency) && (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <TimeField
            required={true}
            format="HH:mm"
            label="Time of Day"
            name="time_of_day"
            key={`${schedule?.id}-time_of_day`}
            defaultValue={dayjs(`2023-06-21T${schedule?.time_of_day ?? "00:00"}`)}
          />
        </LocalizationProvider>
      )}
    </div>
  )
}
