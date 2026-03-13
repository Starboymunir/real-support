import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
import { useTheme } from "@mui/material/styles";
import AwsImageAvatar from "../../../common/aws-image-avatar/Avatar";
import Label from "../../../common/label/label";

interface DriverProfileCoverProps {
  name: string;
  avatarUrl: string;
  role: string;
  coverUrl?: string;
  packageName: string;
  status: string;
}

export default function DriverProfileCover({
  name,
  avatarUrl,
  role,
  coverUrl,
  packageName,
  status,
}: DriverProfileCoverProps) {
  const theme = useTheme();

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      sx={{
        left: { md: 24 },
        bottom: { md: 24 },
        zIndex: { md: 10 },
        pt: { xs: 3, md: 0 },
        position: { md: "absolute" },
      }}
    >
      <AwsImageAvatar
        imageKey={avatarUrl || null}
        alt="Driver Profile Image"
        sx={{
          mx: "auto",
          width: { xs: 64, md: 128 },
          height: { xs: 64, md: 128 },
          border: `solid 2px ${theme.palette.common.white}`,
        }}
      />
      <div>
        <ListItemText
          sx={{
            mt: 3,
            ml: { md: 3 },
            textAlign: { xs: "center", md: "unset" },
          }}
          primary={name}
          secondary={packageName}
          primaryTypographyProps={{
            typography: "h4",
          }}
          secondaryTypographyProps={{
            mt: 0.5,
            color: "inherit",
            component: "span",
            typography: "body2",
            sx: { opacity: 0.48 },
          }}
        />
        <Label
          variant="soft"
          sx={{ ml: 3 }}
          color={
            (status === "ACTIVE" && "success") ||
            (status === "PENDING" && "warning") ||
            (status === "ONHOLD" && "warning") ||
            (status === "SUSPEND" && "error") ||
            (status === "INACTIVE" && "error") ||
            "default"
          }
        >
          {status}
        </Label>
      </div>
    </Stack>
  );
}
