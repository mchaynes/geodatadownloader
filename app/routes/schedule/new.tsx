import { Button, Typography } from "@mui/material";
import { ActionFunction, Form, Navigate, useActionData } from "react-router-dom";
import { scheduledDownloadFromForm } from "../../database";
import DownloadScheduleForm from "../../DownloadScheduleForm";
import { supabase } from '../../supabase'


export const action = async ({ request }) => {
  const formData = await request.formData()
  const sd = scheduledDownloadFromForm(formData)
  return await supabase.from("scheduled_downloads")
    .insert({
      ...sd,
      owner: (await supabase.auth.getSession()).data?.session?.user?.id,
    })
    .select()
    .single()
}

export default function CreateDownloadSchedule() {
  const actionData = useActionData() as Awaited<ReturnType<typeof action>>;
  if (actionData && actionData.data?.id) {
    const { data: { id } } = actionData
    return (
      <Navigate to={`../${id}`} relative={"route"} />
    )
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "10rem" }}>
      <Typography variant="h6">
        Create Scheduled Download
      </Typography>
      <Form method="post">
        <DownloadScheduleForm />
        <div style={{ display: "flex", flexDirection: "row", marginTop: "1rem" }}>
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
