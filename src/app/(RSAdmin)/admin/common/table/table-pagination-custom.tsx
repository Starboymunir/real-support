import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import TablePagination from "@mui/material/TablePagination";
import { SxProps, Theme } from "@mui/material/styles";

interface TablePaginationCustomProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  dense?: boolean;
  onChangeDense?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  rowsPerPageOptions?: number[];
  sx?: SxProps<Theme>;
}

export default function TablePaginationCustom({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  dense = false,
  onChangeDense,
  rowsPerPageOptions = [5, 10, 25],
  sx,
}: TablePaginationCustomProps) {
  return (
    <Box sx={{ position: "relative", ...sx }}>
      <TablePagination
        count={count}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        sx={{ borderTopColor: "transparent" }}
      />

      {onChangeDense && (
        <FormControlLabel
          label="Dense"
          control={<Switch checked={dense} onChange={onChangeDense} />}
          sx={{
            pl: 2,
            py: 1.5,
            top: 0,
            position: {
              sm: "absolute",
            },
          }}
        />
      )}
    </Box>
  );
}
