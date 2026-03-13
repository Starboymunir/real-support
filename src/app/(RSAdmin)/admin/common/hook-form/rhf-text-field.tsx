import { useFormContext, Controller } from "react-hook-form";
import TextField, { TextFieldProps } from "@mui/material/TextField";

interface RHFTextFieldProps extends Omit<TextFieldProps, "name"> {
  name: string;
  disabled?: boolean;
  helperText?: string | React.ReactNode;
  type?: string;
}

export default function RHFTextField({
  name,
  disabled = false,
  helperText = "",
  type = "text",
  ...other
}: RHFTextFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      disabled={disabled}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          type={type}
          value={type === "number" && field.value === 0 ? "" : field.value}
          onChange={(event) => {
            if (type === "number") {
              field.onChange(Number(event.target.value));
            } else {
              field.onChange(event.target.value);
            }
          }}
          error={!!error}
          helperText={error ? error?.message : helperText}
          {...other}
        />
      )}
    />
  );
}
