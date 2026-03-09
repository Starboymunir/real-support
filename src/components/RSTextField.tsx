"use client";

import { TextField } from "@mui/material";
import { Controller, Control } from "react-hook-form";

interface RSTextFieldProps {
  name: string;
  control: Control<any>;
  label?: string;
  placeholder?: string;
  multiline?: boolean;
  minRows?: number;
  [key: string]: any;
}

const RSTextField = ({
  name,
  control,
  label,
  placeholder,
  multiline = false,
  minRows,
  ...rest
}: RSTextFieldProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          fullWidth
          label={label}
          placeholder={placeholder}
          multiline={multiline}
          minRows={minRows}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          sx={{
            backgroundColor: "var(--card)",
            borderRadius: "var(--radius)",
            "& .MuiInputBase-root": {
              color: "var(--card-foreground)", // input text
            },
            "& .MuiInputLabel-root": {
              color: "var(--card-foreground)", // label
            },
            // "& .MuiInputLabel-root.Mui-focused": {
            //   color: "var(--primary)", // focused label
            // },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--input)", // default border
            },
            // "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
            //   {
            //     borderColor: "var(--input)", // focused border
            //   },
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--input)", // remove hover border change
            },
            "& .MuiFormHelperText-root": {
              color: "var(--destructive-foreground)", // error text
            },
          }}
          {...rest}
        />
      )}
    />
  );
};

export default RSTextField;

// sx={{
//   backgroundColor: "var(--card)",
//   borderRadius: "var(--radius)",
//   '& .MuiInputBase-root': {
//     color: "var(--card-foreground)",       // input text
//   },
//   '& .MuiInputLabel-root': {
//     color: "var(--card-foreground)",       // label
//   },
//   '& .MuiInputLabel-root.Mui-focused': {
//     color: "var(--primary)",               // focused label
//   },
//   '& .MuiOutlinedInput-notchedOutline': {
//     borderColor: "var(--input)",           // default border
//   },
//   '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
//     borderColor: "var(--ring)",            // focused border
//   },
//   '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
//     borderColor: "var(--input)",           // remove hover border change
//   },
//   '& .MuiFormHelperText-root': {
//     color: "var(--destructive-foreground)", // error text
//   },
// }}
