import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { StackProps } from "@mui/material";
import Iconify from "@/components/iconify/iconify";

interface EmptyContentProps extends StackProps {
  title?: string;
  imgUrl?: string;
  action?: React.ReactNode;
  filled?: boolean;
  description?: string;
}

export default function EmptyContent({
  title,
  imgUrl,
  action,
  filled,
  description,
  sx,
  ...other
}: EmptyContentProps) {
  return (
    <Stack
      flexGrow={1}
      alignItems="center"
      justifyContent="center"
      sx={{
        px: 3,
        height: 1,
        ...(filled && {
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) =>
            `dashed 1px ${alpha(theme.palette.grey[500], 0.08)}`,
        }),
        ...sx,
      }}
      {...other}
    >
      {imgUrl ? (
        <Box
          component="img"
          alt="empty content"
          src={imgUrl}
          sx={{ width: 1, maxWidth: 160 }}
        />
      ) : (
        <Iconify
          icon="solar:inbox-line-duotone"
          width={120}
          sx={{ color: "text.disabled", opacity: 0.48 }}
        />
      )}

      {title && (
        <Typography
          variant="h6"
          component="span"
          sx={{ mt: 1, color: "text.disabled", textAlign: "center" }}
        >
          {title}
        </Typography>
      )}

      {description && (
        <Typography
          variant="caption"
          sx={{ mt: 1, color: "text.disabled", textAlign: "center" }}
        >
          {description}
        </Typography>
      )}

      {action && action}
    </Stack>
  );
}
