import PropTypes from "prop-types";
import Stack from "@mui/material/Stack";
import { DatePicker } from "@mui/x-date-pickers";
import { useState } from "react";
import { LoadingButton } from "@mui/lab";

export default function DriverWorkSummaryTableToolbar({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onSave,
  loading
}) {
  const [dateError, setDateError] = useState("");

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: "flex-end", md: "center" }}
        direction={{
          xs: "column",
          md: "row",
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          flexGrow={1}
          sx={{ width: 1 }}
        >
          <DatePicker
            label="Start date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
              },
            }}
            sx={{
              maxWidth: { md: 200 },
            }}
          />

          <DatePicker
            label="End date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            slotProps={{
              textField: {
                fullWidth: true,
                error: dateError,
                helperText:
                  dateError && "End date must be later than start date",
              },
            }}
            sx={{
              maxWidth: { md: 200 },
            }}
          />
          <LoadingButton variant="contained" onClick={onSave}>Search..</LoadingButton>
        </Stack>
      </Stack>
    </>
  );
}

DriverWorkSummaryTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
  startDate:PropTypes.string,
  setStartDate:PropTypes.func,
  endDate:PropTypes.string,
  setEndDate:PropTypes.func,
};
