"use client";
import Container from "@mui/material/Container";
import DriversNewEditForm from "../drivers-new-edit-form";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs/custom-breadcrumbs";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { useDriverQuery } from "@/hooks/Drivers";

// ----------------------------------------------------------------------

export default function DriversEditView({ id }: { id: string }) {
  const { data: currentDriver, isLoading } = useDriverQuery(id);

  console.log("-----currentDriver", currentDriver);

  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <Container maxWidth={"xl"}>
          <CustomBreadcrumbs
            heading="Edit"
            links={[
              {
                name: "Dashboard",
                href: paths.dashboard.root,
              },
              {
                name: "Driver",
                href: paths.dashboard.drivers.root,
              },
              { name: currentDriver?.DriverInfo?.firstName },
            ]}
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <DriversNewEditForm currentDriver={currentDriver} />
        </Container>
      )}
    </>
  );
}
