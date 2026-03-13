"use client";

import * as Yup from "yup";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import FormProvider, {
  RHFAutocomplete,
  RHFSelect,
  RHFTextField,
} from "@/app/(RSAdmin)/admin/common/hook-form";
import { Grid, Card, Box, Stack, ListItemText, MenuItem } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import AwsImageAvatar from "@/app/(RSAdmin)/admin/common/aws-image-avatar/Avatar";
import { LoadingScreen } from "@/app/(RSAdmin)/admin/common/loading-screen";
import { createAdminTransaction } from "@/server/AdminTranasaction";
import { getAllPassengers } from "@/server/Passenger";
import { IUser } from "@/types/type";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";

const TransactionType = [
  { value: "EXPENSE", label: "Send" },
  { value: "INCOME", label: "Charge" },
  { value: "COMMISSION", label: "Commission" },
];

export default function AdminTransactionNewEditForm() {
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState<IUser[] | []>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

const AdminTransactionSchema = Yup.object({
  userInfo: Yup.object({
    id: Yup.string().required("User is required"),
  }).nullable(),
  amount: Yup.number().required("Amount is required"),
  type: Yup.string().required("Type is required"),
  narration: Yup.string().optional(),
});

type AdminTransactionFormValues = {
  userInfo: { id: string } | null;
  amount: number;
  type: string;
  narration?: string;
};

const defaultValues: AdminTransactionFormValues = {
  userInfo: null,
  amount: 0,
  type: "",
  narration: "",
};

const methods = useForm<AdminTransactionFormValues>({
  resolver: yupResolver(AdminTransactionSchema),
  defaultValues,
});

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        userId: data?.userInfo!.id,
        amount: data?.amount,
        type: data?.type,
        narration: data?.narration,
      };

      const response = await axiosInstance.post("/payment-transaction/admin", payload);

      if (response.data.success) {
        enqueueSnackbar(`Transaction Successful`);
        router.push("/admin/dashboard/wallet/transactions");
      } else {
        enqueueSnackbar(response.data.message, { variant: "error" });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar("An error occurred", { variant: "error" });
    }
  });

  const fetch = async () => {
    setLoading(true);
    try {
      const passengers = await getAllPassengers();
      setUsers(passengers);
    } catch (err) {
      console.log("Error in passenger fetching:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(1, 1fr)",
              }}
              marginTop={5}
            >
              <RHFAutocomplete
                name="userInfo"
                label="Select User"
                options={users.map((option) => option)}
                getOptionLabel={(option) =>
                  option ? option.firstName + " " + option.lastName : ""
                }
                renderOption={(props, option) => (
                  <li {...props} key={option}>
                    <Box sx={{ mr: 2 }}>
                      <AwsImageAvatar
                        imageKey={option.coverImage}
                        alt={option.firstName}
                      />
                    </Box>
                    <Box>
                      <ListItemText
                        primary={option?.firstName}
                        secondary={option?.emailAddress}
                        primaryTypographyProps={{ typography: "body2" }}
                        secondaryTypographyProps={{
                          component: "span",
                          color: "text.disabled",
                        }}
                      />
                    </Box>
                  </li>
                )}
              />

              <RHFSelect name="type" label="Transaction Type">
                {TransactionType?.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFTextField type="number" name="amount" label="Amount" />
              <RHFTextField multiline rows={4} type="string" name="narration" label="Narration" />
            </Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                {"Create Transaction"}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
