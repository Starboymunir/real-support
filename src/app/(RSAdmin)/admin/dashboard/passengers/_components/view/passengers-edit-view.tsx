"use client";
import Container from "@mui/material/Container";
import PassengersNewEditForm from "../passengers-new-edit-form";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs/custom-breadcrumbs";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { useUserByIdQuery } from "@/hooks/Users";
import { useEffect } from "react";

export default function PassengerEditView({ id }: { id: string }) {
  const { data: currentPassenger, isPending } = useUserByIdQuery(id);

  useEffect(() => {
    console.log("Pessengers edit view is loading");
  }, []);

  return (
    <>
      {isPending ? (
        <LoadingScreen />
      ) : (
        <Container>
          <CustomBreadcrumbs
            heading="Edit"
            links={[
              {
                name: "Dashboard",
                href: paths.dashboard.root,
              },
              {
                name: "Passenger",
                href: paths.dashboard.passengers.root,
              },
              {
                name:
                  currentPassenger?.firstName +
                  " " +
                  currentPassenger?.lastName,
              },
            ]}
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <PassengersNewEditForm currentPassenger={currentPassenger} />
        </Container>
      )}
    </>
  );
}
