"use client";

import { Container } from "@mui/material";
import TransactionCreateForm from "../create-form-admin-transactions";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";

export default function AdminTransactionCreateView() {
  return (
    <Container maxWidth="xl">
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: "Dashboard",
            href: paths.dashboard.root,
          },
          {
            name: "Admin Transaction",
            href: paths.dashboard.wallet.adminTransaction.root,
          },
          { name: "Create" },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <TransactionCreateForm />
    </Container>
  );
}
