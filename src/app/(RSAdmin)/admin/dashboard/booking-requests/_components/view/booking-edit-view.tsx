"use client";

import Container from "@mui/material/Container";
// components
//
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs/custom-breadcrumbs";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import BookingNewEditForm from "../request-edit-form";
import { useRequestQuery } from "@/hooks/Requests";
import { useEffect } from "react";

export default function BookingRequestEditView({ id }: { id: string }) {
  const { data: currentData, isLoading, refetch } = useRequestQuery(id);

  useEffect(() => {
    refetch();
  }, []);

  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <Container maxWidth="xl">
          <CustomBreadcrumbs
            heading="Edit"
            links={[
              {
                name: "Dashboard",
                href: paths.dashboard.root,
              },
              {
                name: "Booking Requests",
                href: paths.dashboard.requests.root,
              },
            ]}
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          {currentData && <BookingNewEditForm currentData={currentData} />}
        </Container>
      )}
    </>
  );
}
