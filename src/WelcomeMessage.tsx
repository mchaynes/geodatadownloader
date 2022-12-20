import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import React, { useEffect, useState } from "react";
import { StatusAlert, useStatusAlert } from "./StatusAlert";

const localStorageKey = "feedback_dismissed";

export function WelcomeMessage() {
  const [data, setData] = useState({
    email: "",
    suggestions: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [submissionProps, setSubmissionProps] = useStatusAlert("", undefined);

  const [isFeedbackDismissed, setFeedbackDismissed] = useState(
    localStorage.getItem(localStorageKey) === "true"
  );

  useEffect(() => {
    localStorage.setItem(localStorageKey, `${isFeedbackDismissed}`);
  }, [isFeedbackDismissed]);

  const onClose = () => {
    setFeedbackDismissed(true);
  };

  const onSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "feedback",
          ...data,
        }).toString(),
      });
      if (response.status !== 200) {
        throw new Error(
          `Error from server: ${response.status} - ${await response.text()}`
        );
      }
      setSubmissionProps("Thank you for the feedback :)", "success");
    } catch (e) {
      console.error(`Failed submit form: ${e.toString()}`, e);
      setSubmissionProps(`Failed to submit form: ${e.toString()}`, "error");
    } finally {
      setLoading(false);
    }
  };
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
                make sure they're features that you'll actually
                /Users/myles/Desktop/IMG_2560.png use. That's where you come in!
                If you could take a moment to fill out this form and share your
                suggestions and any issues you've encountered, it would be a
                huge help. Your input is super valuable as I try to make this
                website the best it can be for everyone.
              </p>
              <p>
                By the way, my name is Myles Haynes, and I am the creator of
                this website. I've built this entire thing on my own. Long Term,
                I'd like to make this website my full time job. The site will
                stay completely open source, including any backend code.
              </p>
              <p>
                Here's a couple of features I am thinking of adding (only ones
                that can't be done in-browser would be paid):
                <ul>
                  <li>Add support for Safari and Firefox</li>
                  <li>
                    Synchronize Feature Layer to ArcGIS Online layer
                    (authenticated feature layers would be supported)
                  </li>
                  <li>
                    Allow a user to schedule (hourly, daily, weekly, monthly) an
                    automatic download, which would then be saved to a backend
                    for the site.
                  </li>
                  <li>
                    Resumable downloads (so if you navigate away from the
                    website accidentally, you could resume a download)
                  </li>
                </ul>
              </p>
            </div>
          </div>

          <Box sx={{ mt: 1, flex: "flex-basis" }}>
            <div>
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
              <Button
                variant="outlined"
                onClick={() => setFeedbackDismissed(true)}
              >
                Dismiss
              </Button>
              <Button variant="contained" onClick={onSubmit}>
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
      alertType={isFeedbackDismissed ? undefined : "info"}
    />
  );
}
