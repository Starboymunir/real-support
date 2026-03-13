import Typography from '@mui/material/Typography';
import Paper, { PaperProps } from '@mui/material/Paper';

interface SearchNotFoundProps extends PaperProps {
  query: string;
}

export default function SearchNotFound({ query, sx, ...other }: SearchNotFoundProps) {
  return query ? (
    <Paper
      sx={{
        bgcolor: 'unset',
        textAlign: 'center',
        ...sx,
      }}
      {...other}
    >
      <Typography variant="h6" gutterBottom>
        Not Found
      </Typography>

      <Typography variant="body2">
        No results found for &nbsp;
        <strong>&quot;{query}&quot;</strong>.
        <br /> Try checking for typos or using complete words.
      </Typography>
    </Paper>
  ) : (
    <Typography variant="body2" sx={sx}>
      Please enter keywords
    </Typography>
  );
}
