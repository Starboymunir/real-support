import React, { useState, useEffect } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { fetchPlaceDetails, fetchPredictions } from "@/lib/utils/GoogleMapsApi";

interface Prediction {
  description: string;
  place_id: string;
  [key: string]: any;
}

interface LocationInputProps {
  name: string;
  label: string;
  disabled?: boolean;
}

const LocationInput = ({ name, label, disabled }: LocationInputProps) => {
  const { control, setValue, watch } = useFormContext();
  const watchedValue = watch(name); // current value from form

  const [options, setOptions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(watchedValue?.description || "");

  useEffect(() => {
    setInputValue(watchedValue?.description || "");
  }, [watchedValue]);

  const handleInputChange = async (_: any, newInputValue: string) => {
    setInputValue(newInputValue);

    if (!newInputValue) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const predictions = await fetchPredictions(newInputValue);
      setOptions(predictions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelect = async (
    _: any,
    value: Prediction | string | null
  ) => {
    if (!value) return setValue(name, null);

    if (typeof value === "string") {
      setValue(name, { description: value });
      return;
    }

    setLoading(true);
    try {
      const details = await fetchPlaceDetails(value);
      setValue(name, details);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          freeSolo
          disableClearable
          disabled={disabled}
          options={options}
          value={
            options.find(
              (option) =>
                typeof option !== "string" &&
                watchedValue &&
                option.place_id === watchedValue.place_id
            ) || undefined
          }
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onChange={handlePlaceSelect}
          getOptionLabel={(option) =>
            typeof option === "string" ? option : option.description
          }
          isOptionEqualToValue={(option, value) => {
            if (!option || !value) return false;
            if (typeof option === "string" && typeof value === "string") {
              return option === value;
            }
            if (
              typeof option === "object" &&
              typeof value === "object" &&
              "place_id" in option &&
              "place_id" in value
            ) {
              return option.place_id === value.place_id;
            }
            return false;
          }}
          loading={loading}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              variant="outlined"
              error={!!error}
              helperText={error?.message}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading && <CircularProgress size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      )}
    />
  );
};

export default LocationInput;
