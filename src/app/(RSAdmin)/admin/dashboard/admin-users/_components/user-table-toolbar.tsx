import { useCallback, ChangeEvent } from "react";
// @mui
import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import Select, { SelectChangeEvent } from "@mui/material/Select";
// components
import Iconify from "@/components/iconify/iconify";

type Filters = {
  search: string;
  role: string[];
};

type UserTableToolbarProps = {
  filters: Filters;
  onFilters: (key: keyof Filters, value: string | string[]) => void;
  roleOptions: string[];
};

export default function UserTableToolbar({
  filters,
  onFilters,
  roleOptions,
}: UserTableToolbarProps) {
  const handleFilterName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onFilters("search", event.target.value);
    },
    [onFilters]
  );

  const handleFilterRole = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const value = event.target.value;
      onFilters("role", typeof value === "string" ? value.split(",") : value);
    },
    [onFilters]
  );

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: "flex-end", md: "center" }}
      direction={{ xs: "column", md: "row" }}
      sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
    >
      <FormControl
        sx={{
          flexShrink: 0,
          width: { xs: 1, md: 200 },
        }}
      >
        <InputLabel>Role</InputLabel>
        <Select
          multiple
          value={filters.role}
          onChange={handleFilterRole}
          input={<OutlinedInput label="Role" />}
          renderValue={(selected) => selected.join(", ")}
          MenuProps={{
            PaperProps: { sx: { maxHeight: 240 } },
          }}
        >
          {roleOptions.map((option) => (
            <MenuItem key={option} value={option}>
              <Checkbox
                disableRipple
                size="small"
                checked={filters.role.includes(option)}
              />
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        flexGrow={1}
        sx={{ width: 1 }}
      >
        <TextField
          fullWidth
          value={filters.search}
          onChange={handleFilterName}
          placeholder="Search..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify
                  icon="eva:search-fill"
                  sx={{ color: "text.disabled" }}
                />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
    </Stack>
  );
}
