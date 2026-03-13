import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Iconify from "@/components/iconify/iconify";

type BookingsTableFiltersResultProps = {
  filters: {
    status: string;
    [key: string]: any;
  };
  onFilters: (key: string, value: any) => void;
  onResetFilters: () => void;
  results: number;
  [key: string]: any;
};

export default function BookingsTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  ...other
}: BookingsTableFiltersResultProps) {
  const handleRemoveStatus = () => {
    onFilters("status", "all");
  };

  const handleRemoveRole = (inputValue: string) => {
    const newValue = filters.role.filter((item: string) => item !== inputValue);
    onFilters("role", newValue);
  };

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: "body2" }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: "text.secondary", ml: 0.25 }}>
          results found
        </Box>
      </Box>

      <Stack
        flexGrow={1}
        spacing={1}
        direction="row"
        flexWrap="wrap"
        alignItems="center"
      >
        {filters.status !== "all" && (
          <Block label="Status:">
            <Chip
              size="small"
              label={filters.status}
              onDelete={handleRemoveStatus}
            />
          </Block>
        )}

        <Button
          color="error"
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Clear
        </Button>
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------
type BlockProps = {
  label: React.ReactNode;
  children: React.ReactNode;
  sx?: object;
  other?: any;
};

function Block({ label, children, sx, ...other }: BlockProps) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: "hidden",
        borderStyle: "dashed",
        ...sx,
      }}
      {...other}
    >
      <Box component="span" sx={{ typography: "subtitle2" }}>
        {label}
      </Box>

      <Stack spacing={1} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  );
}