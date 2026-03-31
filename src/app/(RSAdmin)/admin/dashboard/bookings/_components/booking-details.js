"use client";
import React, { useEffect, useState } from "react";
import { getBookingById } from "@/server/Bookings";
import { Box, Grid, Typography } from "@mui/material";
import { LoadingScreen } from "../../../common/loading-screen";
import moment from "moment/moment";
import AwsImageAvatar from "../../../common/aws-image-avatar/Avatar";
import { Container } from "@mui/system";
import CustomBreadcrumbs from "../../../common/custom-breadcrumbs";
import { paths } from "../../../routes/paths";
import { useSettingsContext } from "../../../common/settings";

const BookingDetails = ({ id }) => {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const settings = useSettingsContext();

  const getBooking = async () => {
    setIsLoading(true);
    try {
      const response = await getBookingById(id);
      setData(response?.data);
      console.log(response?.data);
      console.log(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getBooking();
  }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"}>
      <CustomBreadcrumbs
        heading="Bookings Detail"
        links={[
          { name: "Dashboard", href: paths.dashboard.root },
          { name: "Booking", href: paths?.dashboard?.bookings?.root },
          { name: "Detail" },
        ]}
      />
      <Box>
        {!isLoading ? (
          <Box sx={{ mt: 4, px: 2 }}>
            <Grid container spacing={2}>
              <Grid item md={6}>
                <Box sx={{ my: 2 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                    Passenger Detail's
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: "10px" }}>
                  <Box>
                    <AwsImageAvatar
                      imageKey={data?.riderInfo?.coverImage}
                      alt="passenger"
                    />
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                      {data?.riderInfo?.firstName}
                    </Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                      {data?.riderInfo?.emailAddress}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item md={6}>
                <Box sx={{ my: 2 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                    Driver Detail's
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: "10px" }}>
                  <Box>
                    <AwsImageAvatar
                      imageKey={data?.driverInfo?.userInfo?.coverImage || data?.driverInfo?.userInfo?.profileImageUrl}
                      alt="passenger"
                    />
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                      {data?.driverInfo?.userInfo?.firstName +
                        "" +
                        data?.driverInfo?.userInfo?.lastName}
                    </Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                      {data?.driverInfo?.userInfo?.emailAddress}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item md={12}></Grid>

              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>
                    National Insurance Number
                  </Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                    {data?.nationalInsuranceNumber}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>
                    Self Assesment Tax Id
                  </Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                    {data?.selfAssessmentTaxId}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>Commission</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                    {data?.commission}
                  </Typography>
                </Box>
              </Grid>
              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>Booking Date</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                    {moment(data?.bookingDate).format("MMMM-Do-YYYY")}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>Booking Status</Typography>
                  <Typography
                    sx={{ fontSize: 12, fontWeight: 500, color: "green" }}
                  >
                    {data?.status}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>Package</Typography>
                  <Typography
                    sx={{ fontSize: 12, fontWeight: 500, color: "green" }}
                  >
                    {data?.packageInfo?.name}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>Stops</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                    {data?.stoppages?.length}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>Start from</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                    {data?.startFrom?.name}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>Destination</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                    {data?.destination?.name}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>Persons</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                    {data?.totalPersons ? data?.totalPersons : 0}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>Luggage</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                    {data?.totalLuggage ? data?.totalLuggage : 0}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>Total distance</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                    {data?.totalDistance}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>Total duration</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                    {data?.totalDuration}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>
                    Passenger Rating
                  </Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                    {data?.passengerRating}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>
                    Passenger Review
                  </Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                    {data?.passengerReview}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>Driver Rating</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                    {data?.driverRating}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>Driver Review</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                    {data?.driverReview}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={8} sm={0}></Grid>
              <Grid item md={12}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-end",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <Box sx={{ display: "flex", gap: "10px" }}>
                    <Typography sx={{ fontSize: 14, mr: 4 }}>
                      Discount
                    </Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                      {data?.discountAmount}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: "10px" }}>
                    <Typography sx={{ fontSize: 14, mr: 4 }}>
                      Payment
                    </Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                      {data?.paymentType}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: "10px" }}>
                    <Typography sx={{ fontSize: 14, mr: 4 }}>
                      Total Bill
                    </Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                      {data?.totalBill}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <LoadingScreen />
        )}
      </Box>
    </Container>
  );
};

export default BookingDetails;
