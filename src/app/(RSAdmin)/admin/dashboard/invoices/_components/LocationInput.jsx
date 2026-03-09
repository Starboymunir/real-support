import React, { useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import {
  fetchPlaceDetails,
  fetchPredictions,
} from "@/lib/utils/GoogleMapsApi";

const LocationInput = ({ label, defaultValue, onPlaceSelect, disabled }) => {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const [predictions, setPredictions] = useState([]);

  const handleInputChange = async (event) => {
    setLoading(true);
    const newInputValue = event.target.value;
    setInputValue(newInputValue);
    try {
      const predictions = await fetchPredictions(newInputValue);
      console.log("Predictions :", predictions);
      setPredictions(predictions);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handlePlaceSelect = async (place) => {
    setLoading(true);
    const result = await fetchPlaceDetails(place);
    try {
      onPlaceSelect(result);
      setPredictions([]);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  console.log(defaultValue);
  return (
    <Autocomplete
      freeSolo
      disableClearable
      options={predictions}
      disabled={disabled}
      value={defaultValue || null}
      onChange={(event, newValue) => handlePlaceSelect(newValue)}
      getOptionLabel={(option) => option.description}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          value={selectedValue}
          label={label}
          variant="outlined"
          onChange={handleInputChange}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress color="inherit" size={20} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default LocationInput;
