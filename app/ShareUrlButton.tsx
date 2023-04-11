import React, { useState } from "react";
import { Check, ContentCopy, Error, Share } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import { generateUrl } from "./url";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import Paper from "@mui/material/Paper";

export type ShareUrlButtonParams = {
  params: {
    [param: string]: string;
  };
};
export default function ShareUrlButton({ params }: ShareUrlButtonParams) {
  const urlStr = generateUrl(params);
  const [copyState, setCopyState] = useState<"success" | "error" | "">("");

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(urlStr)
      .then(() => setCopyState("success"))
      .catch(() => setCopyState("error"));
    setTimeout(() => {
      setCopyState("");
    }, 1500);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  return (
    <>
      <IconButton
        aria-describedby={id}
        title="Create shareable URL. You can use this to automatically fill out all fields by just sharing the URL"
        sx={{
          justifyContent: "flex-end",
          maxHeight: "2rem",
        }}
        onClick={handleClick}
      >
        <Share />
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        sx={{ maxWidth: "50%" }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Paper
          sx={{
            paddingTop: 1,
            paddingBottom: 1,
            paddingLeft: 1,
            paddingRight: 1,
            flexFlow: "row nowrap",
            display: "flex",
            padding: "1",
          }}
        >
          <Typography
            component="pre"
            variant="body1"
            noWrap={true}
            sx={{
              p: 1,
              padding: "1rem",
              fontFamily: "monospace",
            }}
          >
            {urlStr}
          </Typography>
          <IconButton onClick={handleCopy}>
            <Badge
              invisible={!copyState}
              badgeContent={
                <Check sx={{ maxWidth: "1rem", maxHeight: "1rem" }} />
              }
              color={copyState === "success" ? "success" : "error"}
            >
              <ContentCopy />
            </Badge>
          </IconButton>
        </Paper>
      </Popover>
    </>
  );
}
