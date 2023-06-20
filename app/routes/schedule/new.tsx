import { Button, Typography } from "@mui/material";
import { useState } from "react";
import { ActionFunction, Form, Link, } from "react-router-dom";
import { scheduledDownloadFromForm } from "../../database";
import DownloadScheduleForm from "../../DownloadScheduleForm";
import { supabase } from '../../supabase'


export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const sd = scheduledDownloadFromForm(formData)
  return await supabase.from("scheduled_downloads")
    .insert({
      ...sd,
      owner: (await supabase.auth.getSession()).data?.session?.user?.id,
    })
}

export default function CreateDownloadSchedule() {

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "10rem" }}>
      <Typography variant="h2">
        Create Scheduled Download
      </Typography>
      <Form method="post">
        <DownloadScheduleForm />
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ flexGrow: 1 }} />
          <Button
            type="submit"
            variant="contained"
          >
            Create
          </Button>
        </div>
      </Form>
    </div>
  )
}
