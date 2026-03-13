import  { ReactNodeLike } from "prop-types";
// @mui
import Box from "@mui/material/Box";
// hooks
import { useBoolean } from "@/app/(RSAdmin)/admin/hooks//use-boolean";
import { useResponsive } from "@/app/(RSAdmin)/admin/hooks//use-responsive";
// components
// import { useSettingsContext } from "@/app/(RSAdmin)/admin/common/settings";
//
import Main from "./main";
import Header from "./header";
// import NavMini from "./nav-mini";
import NavVertical from "./nav-vertical";
// import NavHorizontal from "./nav-horizontal";

// ----------------------------------------------------------------------

export default function DashboardLayout({
  children,
}: {
  children: ReactNodeLike;
}) {
  // return <div>{children}</div>;

  const lgUp = useResponsive("up", "lg");

  const nav = useBoolean();

  // const renderNavMini = <NavMini />;

  // const renderHorizontal = <NavHorizontal />;

  const renderNavVertical = (
    <NavVertical openNav={nav.value} onCloseNav={nav.onFalse} />
  );

  // if (isHorizontal) {
  //   return (
  //     <>
  //       <Header onOpenNav={nav.onTrue} />

  //       {lgUp ? renderHorizontal : renderNavVertical}

  //       <Main>{children}</Main>
  //     </>
  //   );
  // }

  // if (isMini) {
  //   return (
  //     <>
  //       <Header onOpenNav={nav.onTrue} />

  //       <Box
  //         sx={{
  //           minHeight: 1,
  //           display: "flex",
  //           flexDirection: { xs: "column", md: "row" },
  //         }}
  //       >
  //         {lgUp ? renderNavMini : renderNavVertical}

  //         <Main>{children}</Main>
  //       </Box>
  //     </>
  //   );
  // }

  return (
    <>
      <Header onOpenNav={nav.onTrue} />
      <Box
        sx={{
          minHeight: 1,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {renderNavVertical}

        <Main>{children}</Main>
      </Box>
    </>
  );
}