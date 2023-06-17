import { DataStore } from "@aws-amplify/datastore";
import { isAWSTime } from "@aws-amplify/datastore/lib-esm/util";
import { Autocomplete, Button, Checkbox, FormControlLabel, FormGroup, Switch, TextField, Typography } from "@mui/material";
import { LocalizationProvider, TimeField } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from "dayjs";
import { ChangeEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Days, DownloadSchedule, Formats, Frequency } from "./models";


function convertToTitleCase(str: string): string {
  const lowerCaseStr = str.toLowerCase();
  const convertedStr = lowerCaseStr.charAt(0).toUpperCase() + lowerCaseStr.slice(1);
  return convertedStr;
}

export type DownloadScheduleFormProps = {
  schedule: DownloadSchedule
  setSchedule: (_: DownloadSchedule) => void
}

export default function DownloadScheduleForm({ schedule, setSchedule }: DownloadScheduleFormProps) {
  const [daysOfWeek, setDaysOfWeek] = useState<Days[]>(() => {
    if (Array.isArray(schedule?.days_of_the_week)) {
      return schedule?.days_of_the_week.filter((d) => d !== null)
        .map(s => s as Exclude<typeof s, null>)
    }
    return []
  })

  useEffect(() => {
    setSchedule(DownloadSchedule.copyOf(schedule, draft => {
      draft.days_of_the_week = daysOfWeek
    }))
  }, [daysOfWeek, schedule])

  const bindField = (field: keyof DownloadSchedule) => ({
    value: schedule[field] ?? "",
    onChange: (val: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setSchedule(DownloadSchedule.copyOf(schedule, draft => {
        draft[field.toString()] = val.currentTarget.value
      }))
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
                  DownloadSchedule.copyOf(schedule, draft => {
                    draft.active = checked
                  })
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
        value={schedule.format}
        options={Object.keys(Formats)}
        renderInput={(params) => <TextField {...params} />}
        onChange={(_, newVal: Formats) => {
          setSchedule(DownloadSchedule.copyOf(schedule, draft => {
            draft.format = newVal
          }))
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
        value={schedule.frequency}
        options={Object.keys(Frequency)}
        renderInput={(params) => <TextField {...params} />}
        onChange={(_, newVal: Frequency) => {
          setSchedule(DownloadSchedule.copyOf(schedule, draft => {
            draft.frequency = newVal
          }))
        }}
      />
      {schedule.frequency === Frequency.WEEKLY && (
        <FormGroup>
          <div style={{ display: "flex", flexDirection: "row" }}>
            {Object.values(Days).map((day: Days) =>
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
      {(Frequency.DAILY === schedule.frequency || Frequency.MONTHLY == schedule.frequency || Frequency.WEEKLY === schedule.frequency) && (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <TimeField
            format="HH:mm"
            onChange={(evt: Dayjs) => {
              const formattedTime = evt.format("HH:mm:ss.123")
              if (isAWSTime(formattedTime)) {
                setSchedule(DownloadSchedule.copyOf(schedule, draft => {
                  draft.time_of_day = formattedTime
                }))
              }
            }}

            label="Pick Time To Run Job" />

        </LocalizationProvider>
      )}
    </div>
  )
}
