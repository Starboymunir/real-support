import PropTypes from "prop-types";
import { useCallback } from "react";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Iconify from "@/components/iconify/iconify";

// interface PackagesTableToolbarProps {
//   filters: { search: string };
//   onFilters: (key: string, value: string) => void;
// }
interface PackagesTableToolbarProps {
  filters: { search: string; role?: string[] };
  onFilters: (key: "search" | "role", value: string | string[]) => void;
}

export default function PackagesTableToolbar({ filters, onFilters }: PackagesTableToolbarProps) {
  interface FilterNameEvent extends React.ChangeEvent<HTMLInputElement> {}

  const handleFilterName = useCallback(
    (event: FilterNameEvent) => {
      onFilters("search", event.target.value);
    },
    [onFilters]
  );

  return (
    <>
      <div
        className="
    flex 
    flex-col md:flex-row 
    items-end md:items-center 
    p-2.5 pr-2.5 md:pr-1 
    space-y-2 md:space-y-0 md:space-x-2
"
      >
        <div className="flex flex-row items-center space-x-2 flex-grow w-full">
          <TextField
            fullWidth
            value={filters.search}
            onChange={handleFilterName}
            placeholder="Search..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
            }}
          />
        </div>
      </div>
    </>
  );
}