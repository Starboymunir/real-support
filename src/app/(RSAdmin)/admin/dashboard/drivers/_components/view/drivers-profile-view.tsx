"use client";

import { useState, useCallback, SyntheticEvent } from "react";
import Tab from "@mui/material/Tab";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import Iconify from "@/components/iconify/iconify";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs";
import DriverInfo from "../drivers-info";
import DriverCars from "../drivers-cars";
import DriverProfileCover from "../drivers-profile-cover";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { useDriverQuery } from "@/hooks/Drivers";

const TABS = [
  {
    value: "profile",
    label: "Profile",
    icon: <Iconify icon="solar:user-id-bold" width={24} />,
  },
  {
    value: "cars",
    label: "Cars",
    icon: <Iconify icon="fa6-solid:car" width={24} />,
  },
];

export default function DriverProfileView({ id }: { id: string }) {
  const { data: driver, isLoading, refetch } = useDriverQuery(id);

  const [searchCars, setSearchCars] = useState("");

  const [currentTab, setCurrentTab] = useState("profile");

  const handleChangeTab = useCallback(
    (event: SyntheticEvent, newValue: string) => {
      setCurrentTab(newValue);
    },
    []
  );

  const handleSearchCars = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchCars(event.target.value);
    },
    []
  );

  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <>
          <Container maxWidth="xl">
            <CustomBreadcrumbs
              heading="Driver details"
              links={[
                { name: "Dashboard", href: paths?.dashboard?.root },
                { name: "Driver", href: paths?.dashboard?.drivers?.root },
                {
                  name:
                    driver?.userInfo?.firstName +
                    " " +
                    driver?.userInfo?.lastName,
                },
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
              <DriverProfileCover
                role={driver?.userInfo?.emailAddress}
                name={
                  driver?.userInfo?.firstName + " " + driver?.userInfo?.lastName
                }
                avatarUrl={driver?.userInfo.coverImage}
                packageName={driver?.packageInfo?.name}
                status={driver?.status}
              />

              <Tabs
                value={currentTab}
                onChange={handleChangeTab}
                sx={{
                  width: 1,
                  bottom: 0,
                  zIndex: 9,
                  position: "absolute",
                  bgcolor: "background.paper",
                  [`& .${tabsClasses.flexContainer}`]: {
                    pr: { md: 3 },
                    justifyContent: {
                      xs: "center",
                      md: "center",
                    },
                  },
                }}
              >
                {TABS.map((tab) => (
                  <Tab
                    key={tab.value}
                    value={tab.value}
                    icon={tab.icon}
                    label={tab.label}
                  />
                ))}
              </Tabs>
            </Card>

            {currentTab === "profile" && (
              <DriverInfo refetch={refetch} info={driver} />
            )}

            {currentTab === "cars" && (
              <DriverCars
                cars={driver?.cars}
                searchCars={searchCars}
                onSearchCars={handleSearchCars}
              />
            )}
          </Container>
        </>
      )}
    </>
  );
}
