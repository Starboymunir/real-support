"use client";

import { useTheme } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import {
  _appFeatured,
  _appAuthors,
  _appInstalled,
  _appRelated,
  _appInvoices,
} from "@/_mock";
import AppWidgetSummary from "../app-widget-summary";
import { useState } from "react";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import GoogleMap from "../google-map";
import Card from "@mui/material/Card";

const OverviewAppView = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  return (
    <>
      {loading ? (
        <LoadingScreen />
      ) : (
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid xs={12} md={12} lg={12}>
              <Card sx={{ display: "flex", alignItems: "center", p: 0 }}>
                <GoogleMap />
              </Card>
            </Grid>
            <Grid xs={12} md={4}>
              <AppWidgetSummary
                title="Total No Riders"
                percent={2.6}
                total={0}
                chart={{
                  colors: [theme.palette.info.light, theme.palette.info.main],
                  series: [5, 18, 12, 51, 68, 11, 39, 37, 27, 20],
                }}
              />
            </Grid>

            <Grid xs={12} md={4}>
              <AppWidgetSummary
                title="Total No Drivers"
                percent={0.2}
                total={0}
                chart={{
                  colors: [theme.palette.info.light, theme.palette.info.main],
                  series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26],
                }}
              />
            </Grid>

            <Grid xs={12} md={4}>
              <AppWidgetSummary
                title="Total No Bookings"
                percent={-0.1}
                total={0}
                chart={{
                  colors: [
                    theme.palette.warning.light,
                    theme.palette.warning.main,
                  ],
                  series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
                }}
              />
            </Grid>
          </Grid>
        </Container>
      )}
    </>
  );
};

export default OverviewAppView;
