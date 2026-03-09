import { useFormContext, Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import PropTypes from "prop-types";

// Types
interface RHFAutocompleteProps {
  name: string;
  label: string;
  placeholder?: string;
  helperText?: string;
  options: any[];
  getOptionLabel?: (option: any) => string;
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: any
  ) => React.ReactNode;
  isOptionEqualToValue?: (option: any, value: any) => boolean;
  [key: string]: any;
}

export default function RHFAutocomplete({
  name,
  label,
  placeholder,
  helperText = "",
  options,
  getOptionLabel = (option) => option?.label || "",
  renderOption,
  isOptionEqualToValue = (option, value) => option.id === value.id,
  ...other
}: RHFAutocompleteProps) {
  const { control, setValue } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
        <Autocomplete
          value={value || null}
          onChange={(_, newValue) => {
            setValue(name, newValue, { shouldValidate: true });
            onChange(newValue);
          }}
          options={options}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={isOptionEqualToValue}
          renderOption={renderOption}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              inputRef={ref}
              placeholder={placeholder}
              error={!!error}
              helperText={error?.message || helperText}
            />
          )}
          {...other}
        />
      )}
    />
  );
}
