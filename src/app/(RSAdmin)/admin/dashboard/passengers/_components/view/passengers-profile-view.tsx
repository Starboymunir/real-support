"use client";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs";
import PassengerProfileCover from "../passengers-profile-cover";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import PassengerBookingListView from "../../../bookings/_components/view/passenger-booking-list-view";
import UserTransactionsListView from "../../../wallet/transactions/_components/view/user-transactions-list-view";
import { useUserByIdQuery } from "@/hooks/Users";

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
