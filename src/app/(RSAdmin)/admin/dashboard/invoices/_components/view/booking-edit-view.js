"use client";

import PropTypes from "prop-types";
// @mui
import Container from "@mui/material/Container";
// components
//
import { useEffect, useState } from "react";
import { useSettingsContext } from "@/app/(RSAdmin)/admin/common/settings";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs/custom-breadcrumbs";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import BookingNewEditForm from "../booking-edit-form";
import { getBookingById, getBookingRequestById } from "@/server/Bookings";


export default function BookingEditView({ id }) {
  const [currentData, setCurrentData] = useState({});
  const [loading, setLoading] = useState(true);
  const settings = useSettingsContext();

  const fetch = async () => {
    setLoading(true);
    try {
      const { data, statusCode } = await getBookingById(id)
      if (statusCode === 200) {
        setCurrentData(data);
      }
    } catch (error) {
      console.log(error);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <>
      {loading ? (
        <LoadingScreen />
      ) : (
        <Container maxWidth={settings.themeStretch ? false : "xl"}>
          <CustomBreadcrumbs
            heading="Booking Edit"
            links={[
              {
                name: "Dashboard",
                href: paths.dashboard.root,
              },
              {
                name: "Booking",
                href: paths.dashboard.requests.root,
              }            ]}
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <BookingNewEditForm currentData={currentData} />
        </Container>
      )}
    </>
  );
}

BookingEditView.propTypes = {
  id: PropTypes.string,
};
