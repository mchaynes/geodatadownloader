import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { StatusAlert, useStatusAlert } from "./StatusAlert";

const localStorageKey = "feedback_dismissed";

export function WelcomeMessage() {
  const [data, setData] = useState({
    email: "",
    suggestions: "",
    dismissed: localStorage.getItem(localStorageKey) ?? "false",
  });
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);

  const [submissionProps, setSubmissionProps] = useStatusAlert("", undefined);

  const submit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
        },
        body: new URLSearchParams({
          ...data,
        }).toString(),
      });
      if (!response.ok) {
        throw new Error(
          `Error from server: ${response.status} - ${await response.text()}`
        );
      }
      if (data.dismissed !== "true") {
        setSubmissionProps("Thank you for the feedback :)", "success");
      }
    } catch (e) {
      if (e instanceof Error) {
        console.error(`Failed submit form: ${e.toString()}`, e);
        if (data.dismissed !== "true") {
          setSubmissionProps(`Failed to submit form: ${e.toString()}`, "error");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem(localStorageKey, data.dismissed);
  }, [data]);

  const onClose = () => {
    setData((data) => ({
      ...data,
      dismissed: "true",
    }));
  };

  useEffect(() => {
    setDisabled(data.email.length === 0 && data.suggestions.length === 0)
  }, [data]);

  return (
    <StatusAlert
      onClose={onClose}
      sx={{ m: 3 }}
      msg={
        <>
          <div
            style={{
              display: "flex",
              gap: 10,
              flex: "fit-content",
              flexDirection: "row",
            }}
          >
            <Avatar src="/myles.png" sx={{ width: 100, height: 100 }} />
            <div style={{ flex: 2 }}>
              <p>
                I'm looking to add more features to the website, but I want to
                make sure they're features that you'll actually use. If you
                could take a moment to fill out this form and share your
                suggestions and any issues you've encountered, it would be a
                huge help. I really care about your input.
              </p>
              <p>
                By the way, my name is Myles Haynes, and I am the creator of
                this website. I've built this entire thing on my own. The site
                will stay completely open source, including any backend code.
              </p>
              <p>
                Here's a couple of features I am thinking of adding (only ones
                that can't be done in-browser would be paid):
              </p>
              <ul>
                <li>
                  Synchronize Feature Layer to ArcGIS Online layer
                  (authenticated feature layers would be supported)
                </li>
                <li>
                  Allow a user to schedule (hourly, daily, weekly, monthly) an
                  automatic download, which would then be saved to a backend for
                  the site.
                </li>
                <li>
                  Resumable downloads (so if you navigate away from the website
                  accidentally, you could resume a download)
                </li>
              </ul>
            </div>
          </div>

          <Box sx={{ mt: 1 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <TextField
                fullWidth={true}
                id="email"
                label="Email (if you want a response back)"
                type="email"
                variant="outlined"
                size="small"
                value={data.email}
                onChange={(e) =>
                  setData((data) => ({
                    ...data,
                    email: e.target.value,
                  }))
                }
              />
              <TextField
                sx={{ mt: 2 }}
                fullWidth={true}
                required={true}
                id="suggestions"
                label="Suggestions"
                multiline
                rows={10}
                variant="outlined"
                size="small"
                value={data.suggestions}
                onChange={(e) =>
                  setData((data) => ({
                    ...data,
                    suggestions: e.target.value,
                  }))
                }
              />
            </div>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 4,
                mt: 2,
              }}
            >
              <Button variant="outlined" onClick={onClose}>
                Dismiss
              </Button>
              <Button id="submit" disabled={disabled} variant="contained" onClick={() => void submit()}>
                Submit
              </Button>
            </Box>
            <StatusAlert
              loading={loading}
              {...submissionProps}
              sx={{ mt: 1 }}
            />
          </Box>
        </>
      }
      alertType={data.dismissed === "true" ? undefined : "info"}
    />
  );
}
