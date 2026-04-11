"use client";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs";
import PassengerProfileCover from "../passengers-profile-cover";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import PassengerBookingListView from "../../../bookings/_components/view/passenger-booking-list-view";
import UserTransactionsListView from "../../../wallet/transactions/_components/view/user-transactions-list-view";
import { useUserByIdQuery } from "@/hooks/Users";
import Iconify from "@/components/iconify/iconify";

export default function PassengerProfileView({ id }: { id: string }) {
  const { data: passenger, isPending } = useUserByIdQuery(id);

  return (
    <>
      {isPending ? (
        <LoadingScreen />
      ) : (
        <>
          <Container>
            <CustomBreadcrumbs
              heading="Passenger details"
              links={[
                { name: "Dashboard", href: paths.dashboard.root },
                { name: "Passenger", href: paths.dashboard.passengers.root },
                { name: passenger?.firstName + " " + passenger?.lastName },
              ]}
              sx={{
                mb: { xs: 3, md: 5 },
              }}
            />

            <Card
              sx={{
                mb: 3,
                height: { xs: 230, md: 170 },
              }}
            >
              <PassengerProfileCover
                role={passenger?.emailAddress || ""}
                avatarUrl={passenger?.coverImage || ""}
                name={passenger?.firstName + " " + passenger?.lastName}
                phone_number={`${passenger?.phone_number}`}
                ratings={passenger?.ratings || 5}
              />
            </Card>

            {/* Passenger Details Card */}
            <Card sx={{ mb: 3, p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Passenger Information
              </Typography>
              <Grid container spacing={2}>
                {[
                  { icon: "mdi:account", label: "Full Name", value: `${passenger?.firstName || ""} ${passenger?.lastName || ""}` },
                  { icon: "mdi:email", label: "Email", value: passenger?.emailAddress || "-" },
                  { icon: "mdi:phone", label: "Phone", value: passenger?.phone_number || "-" },
                  { icon: "mdi:star", label: "Rating", value: passenger?.ratings ? `${passenger.ratings} / 5` : "-" },
                  { icon: "mdi:wallet", label: "Wallet Balance", value: passenger?.wallet?.balance != null ? `£${Number(passenger.wallet.balance).toFixed(2)}` : "-" },
                  { icon: "mdi:calendar", label: "Registered", value: passenger?.createdAt ? new Date(passenger.createdAt).toLocaleDateString() : "-" },
                ].map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.label}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Iconify icon={item.icon} width={24} sx={{ color: "text.secondary" }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {item.label}
                        </Typography>
                        <Typography variant="body2">{item.value}</Typography>
                      </Box>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Card>

            <Card
              sx={{
                mb: 3,
              }}
            >
              <PassengerBookingListView passengerId={id} />
            </Card>

            <Card>
              <UserTransactionsListView userId={id} />
            </Card>
          </Container>
        </>
      )}
    </>
  );
}
