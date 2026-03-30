"use client";
import Container from "@mui/material/Container";
// routes
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import CustomBreadcrumbs from "@/app/(RSAdmin)/admin/common/custom-breadcrumbs";
//
import UserNewEditForm from "../user-new-edit-form";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import Button from "@mui/material/Button";
import { deleteAdmin } from "@/server/Admin";
import { useRouter } from "next/navigation";
import { useAdminUserQuery } from "@/hooks/Admin";

// ----------------------------------------------------------------------

export default function UserEditView({ id }: { id: string }) {
  const router = useRouter();
  const { data: currentUser, isLoading } = useAdminUserQuery(id);

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
                name: "Admin Users",
                href: paths.dashboard.user.root,
              },
              {
                name: `${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`,
              },
            ]}
            sx={{
              mb: { xs: 3, md: 5 },
            }}
          />

          <UserNewEditForm currentUser={currentUser} />
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              deleteAdmin(id).then((e) => {
                router.replace(paths.dashboard.user.root);
              });
            }}
            sx={{
              my: 5,
              mx: 15,
              float: "right",
            }}
          >
            Delete admin
          </Button>
        </Container>
      )}
    </>
  );
}
