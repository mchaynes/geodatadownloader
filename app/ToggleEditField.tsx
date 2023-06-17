import Edit from "@mui/icons-material/Edit"
import EditOff from "@mui/icons-material/EditOff"
import Autocomplete from "@mui/material/Autocomplete"
import IconButton from "@mui/material/IconButton"
import InputAdornment from "@mui/material/InputAdornment"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Tooltip from "@mui/material/Tooltip"
import { useState } from "react"

export type ToggleEditFieldProps = {
  label?: string
  placeholder?: string
  value: string
  options?: string[]
  onChange: (val?: string) => void
}
export default function ToggleEditField({ value, onChange, label, placeholder, options }: ToggleEditFieldProps) {
  const [disabled, setDisabled] = useState(true)

  return (
    <>
      {options && options.length > 0 ?
        <Autocomplete
          value={value}
          options={options}
          sx={{ width: "100%" }}
          renderInput={(params) => <TextField {...params} />}
          onChange={(_, newVal) => onChange(newVal ?? undefined)}
        />
        :
        <TextField
          variant="outlined"
          label={label}
          placeholder={placeholder}
          fullWidth
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          size="small"
          InputProps={{
            endAdornment:
              <BoundaryAdornment
                content={value}
                disabled={disabled}
                setDisabled={setDisabled}
              />,
          }}
        />
      }
    </>
  )
}
type BoundaryAdornmentProps = {
  content: string
  disabled: boolean
  setDisabled: (_: boolean) => void
}

// ExtentAdornment contains an EditToggle and a Copy to Clipboard button
function BoundaryAdornment({ content, setDisabled, disabled }: BoundaryAdornmentProps) {
  const handleEditClick = () => {
    setDisabled(!disabled);
  };
  return (
    <InputAdornment position="end">
      <Stack direction="row">
        <Tooltip
          placement="top-start"
          title={disabled ? "Enable editing" : "Disable editing"}
        >
          <IconButton
            onClick={handleEditClick}
          >
            {disabled ? <Edit /> : <EditOff />}
          </IconButton>
        </Tooltip>
      </Stack>
    </InputAdornment>
  );
}
