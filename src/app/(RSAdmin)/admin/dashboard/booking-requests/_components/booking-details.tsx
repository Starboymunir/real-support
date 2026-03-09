"use client";

import React, { useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { LoadingScreen } from "../../../common/loading-screen";
import moment from "moment/moment";
import AwsImageAvatar from "../../../common/aws-image-avatar/Avatar";
import CustomBreadcrumbs from "../../../common/custom-breadcrumbs/custom-breadcrumbs";
import { Container } from "@mui/system";
import { paths } from "../../../routes/paths";
import { useRequestQuery } from "@/hooks/Requests";
import { formatDistance, formatDuration } from "@/lib/helper-function";

const BookingRequestDetails = ({ id }: { id: string }) => {
  const { data, isPending } = useRequestQuery(id);

  const getTotal = () => {
    const total = (data?.totalBill ?? 0) - (data?.discountAmount ?? 0);
    return total;
  };

  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Bookings Request Detail"
        links={[
          { name: "Dashboard", href: paths.dashboard.root },
          { name: "Requests", href: paths.dashboard.requests.root },
          { name: "Detail" },
        ]}
      />
      <Box>
        {!isPending ? (
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

              <Grid item md={12}></Grid>

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
                    {data?.stoppages?.length ?? 0}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>Start from</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                    {data?.startFrom?.description}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>Destination</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                    {data?.destination?.description}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>Persons</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                    {data?.totalPersons ?? 0}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>Luggage</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                    {data?.totalLuggage ?? 0}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>Total distance</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                    {formatDistance(data?.totalDistance ?? 0)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={3} my={2}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: 14 }}>Total duration</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                    {formatDuration(data?.totalDuration ?? 0)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={8} sm={0}></Grid>
              <Grid item md={4}>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: "10px" }}
                >
                  <Box sx={{ display: "flex", gap: "10px" }}>
                    <Typography sx={{ fontSize: 14, mr: 4 }}>
                      Total Bill
                    </Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                      {data?.totalBill}
                    </Typography>
                  </Box>
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
                      Net total
                    </Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 500 }}>
                      {getTotal()}
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

export default BookingRequestDetails;
