import { forwardRef } from "react";
// @mui
import { useTheme } from "@mui/material/styles";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
// routes
import { RouterLink } from "@/app/(RSAdmin)/admin/routes/components";
import Image from "next/image";
import logoImage from "../../../../../../public/assets/logo.png";
// ----------------------------------------------------------------------

type LogoProps = {
  disabledLink?: boolean;
  sx?: object;
  [key: string]: any;
};

const Logo = forwardRef<HTMLDivElement, LogoProps>(({ disabledLink = false, sx, ...other }, ref) => {
  const logo = (
    <Box
      ref={ref}
      component="div"
      sx={{
        width: 40,
        height: 40,
        display: "inline-flex",
        ...sx,
      }}
      {...other}
    ></Box>
  );

  if (disabledLink) {
    return logo;
  }

  return (
    <Link component={RouterLink} href="/admin/dashboard" sx={{ display: "contents" }}>
      <Image src={logoImage} height={100} alt="logo" />
    </Link>
  );
});

export default Logo;
