import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

export type OnWhereChange = (where: string) => void;

export type WhereProps = {
  defaultWhere: string;
  onChange: OnWhereChange;
};

export function Where({ defaultWhere, onChange: onWhereChange }: WhereProps) {
  const [where, setWhere] = useState(defaultWhere);

  useEffect(() => {
    const timer = setTimeout(() => onWhereChange(where), 500);
    return () => clearTimeout(timer);
  }, [where, onWhereChange]);

  const handleBlur = () => {
    if (where === "") {
      setWhere("1=1");
    }
  };

  return (
    <Box>
      <TextField
        id="where-text-field"
        required
        fullWidth
        variant="outlined"
        label="Where"
        helperText={
          <Typography variant="caption">
            {
              "Ex: population BETWEEN 100 AND 500, population <= 100, city = 'Seattle'. Use 1=1 to return all features"
            }
          </Typography>
        }
        value={where}
        onBlur={handleBlur}
        onChange={(e) => setWhere(e.currentTarget.value)}
      />
    </Box>
  );
}
