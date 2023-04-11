import ContentCopy from "@mui/icons-material/ContentCopy";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";

export type CopyButtonProps = {
  data: string;
};

export default function CopyButton({ data }: CopyButtonProps) {
  const [copyState, setCopyState] = useState<"success" | "error" | "">("");
  const handleCopy = () => {
    navigator.clipboard
      .writeText(data)
      .then(() => setCopyState("success"))
      .catch(() => setCopyState("error"));
    setTimeout(() => {
      setCopyState("");
    }, 1500);
  };
  return (
    <Tooltip
      placement="top-start"
      title={copyState === "success" ? "Copied" : "Click to Copy"}
      TransitionProps={{
        onExited: () => setCopyState(""),
      }}
    >
      <IconButton aria-label="copy extent to clipboard" onClick={handleCopy}>
        <ContentCopy />
      </IconButton>
    </Tooltip>
  );
}
