import React from "react";
import { ContentCopy, Share } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import { generateUrl } from "./url";
import Typography from "@mui/material/Typography";
import { Paper } from "@mui/material";

export type ShareUrlButtonParams = {
  params: {
    [param: string]: string;
  };
};
export default function ShareUrlButton({ params }: ShareUrlButtonParams) {
  const urlStr = generateUrl(params);

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    navigator.clipboard.writeText(urlStr).catch((err) => console.error(err));
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
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
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
            sx={{
              p: 1,
              padding: "1rem",
              fontFamily: "monospace",
            }}
          >
            {urlStr}
          </Typography>
          <IconButton>
            <ContentCopy />
          </IconButton>
        </Paper>
      </Popover>
    </>
  );
}
