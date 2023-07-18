import ContentCopy from "@mui/icons-material/ContentCopy";
import { Button, Tooltip } from "flowbite-react";
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
      content={copyState === "success" ? "Copied" : "Click to Copy"}
    >
      <Button
        className="text-gray-500 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 w-10 h-10"
        aria-label="copy extent to clipboard" onClick={handleCopy}>
        <ContentCopy />
      </Button>
    </Tooltip>
  );
}
