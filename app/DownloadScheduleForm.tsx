import { Autocomplete, Checkbox, FormControlLabel, FormGroup, Switch, TextField, Typography } from "@mui/material";
import { LocalizationProvider, TimeField } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from "dayjs";
import { ChangeEvent, SetStateAction, useEffect, useState } from "react";
import { DownloadSchedule } from "./models";
import { Day, Days, Format, Formats, Frequencies, Frequency, ScheduledDownload, ScheduledDownloadUpdate } from "./types";


function convertToTitleCase(str: string): string {
  const lowerCaseStr = str.toLowerCase();
  const convertedStr = lowerCaseStr.charAt(0).toUpperCase() + lowerCaseStr.slice(1);
  return convertedStr;
}

export type DownloadScheduleFormProps = {
  schedule: ScheduledDownloadUpdate
  setSchedule: SetStateAction<ScheduledDownloadUpdate>
}

export default function DownloadScheduleForm({ schedule, setSchedule }: DownloadScheduleFormProps) {
  const [daysOfWeek, setDaysOfWeek] = useState<Day[]>(() => {
    if (Array.isArray(schedule?.days_of_week)) {
      return schedule?.days_of_week.filter((d) => d !== null)
        .map(s => s as Exclude<typeof s, null>)
    }
    return []
  })

  useEffect(() => {
    setSchedule({
      ...schedule,
      days_of_week: daysOfWeek
    })
  }, [daysOfWeek, schedule])

  const bindField = (field: keyof DownloadSchedule) => ({
    value: schedule[field] ?? "",
    onChange: (val: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setSchedule({
        ...schedule,
        [field]: val,
      })
    }
  })
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", gap: "2rem" }}>
        <TextField
          label={"Job Name"}
          sx={{ justifySelf: "flex-start", flexGrow: 1 }}
          placeholder={"King County Wetlands - Daily"}
          required={true}
          {...bindField("job_name")}
        />
        <FormGroup>
          <FormControlLabel
            sx={{ justifySelf: "flex-end", flexGrow: 1 }}
            control={
              <Switch
                value={schedule.active ?? true}
                onChange={(_, checked) => setSchedule(
                  {
                    ...schedule,
                    active: checked,
                  }
                )}
                defaultChecked
              />
            }
            label="Active"
          />
        </FormGroup>
      </div>
      <TextField
        label={"Layer URL"}
        placeholder={"https://gismaps.kingcounty.gov/arcgis/rest/services/Environment/KingCo_SensitiveAreas/MapServer/11"}
        required={true}
        {...bindField("layer_url")}
      />
      <Autocomplete
        value={schedule.format ?? "gpkg"}
        options={Formats}
        renderInput={(params) => <TextField {...params} />}
        onChange={(_, newVal: Format) => {
          setSchedule({
            ...schedule,
            format: newVal,
          })
        }}
      />
      <TextField
        label={"Where"}
        placeholder={"1=1"}
        {...bindField("where")}
      />
      <TextField
        label={"Boundary"}
        placeholder={"Paste in JSON boundary"}
        {...bindField("boundary")}
      />

      <TextField
        label={"Destination (R2 or S3 endpoint)"}
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
      <Autocomplete
        value={schedule.frequency ?? "weekly"}
        options={Frequencies}
        renderInput={(params) => <TextField {...params} />}
        onChange={(_, newVal: Frequency) => {
          setSchedule({
            ...schedule,
            frequency: newVal,
          })
        }}
      />
      {schedule.frequency === "weekly" && (
        <FormGroup>
          <div style={{ display: "flex", flexDirection: "row" }}>
            {Days.map((day: Day) =>
              <FormControlLabel key={day} control={<Checkbox onChange={(evt) => {
                const { target: { checked } } = evt
                if (checked && !daysOfWeek.includes(day)) {
                  setDaysOfWeek(days => [day, ...days])
                }
                if (!checked) {
                  setDaysOfWeek(days => days.filter(d => d !== day))
                }
              }} />} label={convertToTitleCase(day)} />
            )}
          </div>
        </FormGroup>
      )}
      {("daily" === schedule.frequency || "monthly" == schedule.frequency || "weekly" === schedule.frequency) && (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <TimeField
            format="HH:mm"
            onChange={(evt: Dayjs) => {
              const formattedTime = evt.format("HH:mm")
              setSchedule({
                ...schedule,
                time_of_day: formattedTime,
              })
            }
            } />
        </LocalizationProvider>
      )}
    </div>
  )
}
