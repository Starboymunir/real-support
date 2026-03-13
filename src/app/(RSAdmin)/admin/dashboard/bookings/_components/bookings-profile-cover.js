import PropTypes from "prop-types";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import ListItemText from "@mui/material/ListItemText";
import { useTheme } from "@mui/material/styles";

export default function BookingsProfileCover({
  name,
  avatarUrl,
  role,
  phone_number,
  ratings,
}) {
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
      <Avatar
        src={avatarUrl}
        alt={name}
        sx={{
          mx: "auto",
          width: { xs: 64, md: 128 },
          height: { xs: 64, md: 128 },
          border: `solid 2px ${theme.palette.common.white}`,
        }}
      />

      <ListItemText
        sx={{
          mt: 3,
          ml: { md: 3 },
          textAlign: { xs: "center", md: "unset" },
        }}
        primary={name}
        secondary={role}
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
      <ListItemText
        sx={{
          mt: 3,
          ml: { md: 50 },
          textAlign: { xs: "center", md: "right" },
        }}
        primary={`Phone: ${phone_number}`}
        secondary={`Stars: ${ratings}`}
        primaryTypographyProps={{
          typography: "body1",
        }}
        secondaryTypographyProps={{
          mt: 0.5,
          color: "inherit",
          component: "span",
          typography: "body2",
          sx: { opacity: 0.48 },
        }}
      />
    </Stack>
  );
}

BookingsProfileCover.propTypes = {
  avatarUrl: PropTypes.string,
  coverUrl: PropTypes.string,
  name: PropTypes.string,
  role: PropTypes.string,
  phone_number: PropTypes.string,
};
