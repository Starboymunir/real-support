import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import EmptyContent from '../empty-content';
import { StackProps } from '@mui/material';

interface TableNoDataProps {
  notFound: boolean;
  sx?: StackProps['sx'];
}

export default function TableNoData({ notFound, sx }: TableNoDataProps) {
  return (
    <TableRow>
      {notFound ? (
        <TableCell colSpan={12}>
          <EmptyContent
            filled
            title="No Data"
            sx={{
              py: 10,
              ...sx,
            }}
          />
        </TableCell>
      ) : (
        <TableCell colSpan={12} sx={{ p: 0 }} />
      )}
    </TableRow>
  );
}
