"use client";

import PropTypes from "prop-types";
// @mui
import Container from "@mui/material/Container";
// components
//
import PackageNewEditForm from "../packages-new-edit-form";
import { useEffect, useState } from "react";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs/custom-breadcrumbs";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { usePackageQuery } from "@/hooks/Packages";

export const PackagesEditView = ({ id }: { id: string }) => {
  const { data: currentPackage, isLoading } = usePackageQuery(id);

  return (
    <>
      {isLoading ? (
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
                name: "Package",
                href: paths.dashboard.passengers.root,
              },
              { name: currentPackage?.name },
            ]}
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <PackageNewEditForm currentPackage={currentPackage} />
        </Container>
      )}
    </>
  );
};

export default PackagesEditView;
