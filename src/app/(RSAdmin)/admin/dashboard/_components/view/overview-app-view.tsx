"use client";

import { useTheme } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import AppWidgetSummary from "../app-widget-summary";
import { useState, useEffect } from "react";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import dynamic from "next/dynamic";
import Card from "@mui/material/Card";
import { adminStatsApi, type DashboardStats } from "@/lib/services/admin";

const GoogleMap = dynamic(() => import("../google-map"), { ssr: false });

const OverviewAppView = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    adminStatsApi
      .getDashboardStats()
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {loading ? (
        <LoadingScreen />
      ) : (
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <AppWidgetSummary
                title="Total No Riders"
                percent={2.6}
                total={stats?.totalPassengers ?? 0}
                chart={{
                  colors: [theme.palette.secondary.light, theme.palette.secondary.main],
                  series: [5, 18, 12, 51, 68, 11, 39, 37, 27, 20],
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <AppWidgetSummary
                title="Total No Drivers"
                percent={0.2}
                total={stats?.totalDrivers ?? 0}
                chart={{
                  colors: [theme.palette.info.light, theme.palette.info.main],
                  series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26],
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <AppWidgetSummary
                title="Total No Bookings"
                percent={-0.1}
                total={stats?.totalBookings ?? 0}
                chart={{
                  colors: [
                    theme.palette.warning.light,
                    theme.palette.warning.main,
                  ],
                  series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ display: "flex", alignItems: "center", p: 0, minHeight: 400 }}>
                <GoogleMap />
              </Card>
            </Grid>
          </Grid>
        </Container>
      )}
    </>
  );
};

export default OverviewAppView;
