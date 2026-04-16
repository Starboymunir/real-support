"use client";

import * as Yup from "yup";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "@/app/(RSAdmin)/admin/common/snackbar";
import FormProvider, {
  RHFTextField,
} from "@/app/(RSAdmin)/admin/common/hook-form";
import { Grid, Card, Box, Stack } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { LoadingButton } from "@mui/lab";
import {
  createDiscountCoupon,
  updateDiscountCoupon,
} from "@/server/DiscountCoupons";
import { DiscountCoupons } from "@/lib/types";
import axiosInstance from "@/lib/admin-axios";
import { useRouter } from "../../../routes/hook";
import { paths } from "@/app/(RSAdmin)/admin/routes/paths";
import { useQueryClient } from "@tanstack/react-query";

export default function DiscountCouponsNewEditForm({
  currentCoupon,
}: {
  currentCoupon: DiscountCoupons | null;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const queryClient = useQueryClient();

  const DiscountCouponSchema = Yup.object().shape({
    coupon: Yup.string().required("Coupon code is required"),
    discount: Yup.number().required("Discount amount is required"),
    useability: Yup.number().required("Usage limit is required"),
    expiry: Yup.date().required("Expiry date is required"),
  });

  const defaultValues = useMemo(
    () => ({
      coupon: currentCoupon?.coupon || "",
      discount: currentCoupon?.discount || 0,
      useability: currentCoupon?.useability || 1,
      expiry: currentCoupon?.expiry || new Date(),
    }),
    [currentCoupon]
  );

  const methods = useForm({
    resolver: yupResolver(DiscountCouponSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentCoupon) {
        const response = await axiosInstance.patch(
          `/coupons/${currentCoupon.id}`,
          data
        );
        if (response.data.success) {
          queryClient.invalidateQueries({ queryKey: ["discountCoupons"] });
          enqueueSnackbar(response.data.message);
          router.push(paths.dashboard.discountCoupons.root);
        }
        enqueueSnackbar("Coupon updated successfully");
      } else {
        const { statusCode, message } = await createDiscountCoupon(data as any);
        if (statusCode !== 200) {
          enqueueSnackbar(message, { variant: "error" });
        }
        queryClient.invalidateQueries({ queryKey: ["discountCoupons"] });
        enqueueSnackbar("Coupon created successfully");
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar("An error occurred", { variant: "error" });
    }
  });

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
                sm: "repeat(2, 1fr)",
              }}
              marginTop={5}
            >
              <RHFTextField name="coupon" label="Coupon Code" />
              <RHFTextField type="number" name="discount" label="Discount %" />
            </Box>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
              }}
              marginTop={5}
            >
              <RHFTextField
                type="number"
                name="useability"
                label="Usage Limit"
              />
              <Controller
                name="expiry"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DatePicker
                    label="Expiry Date"
                    disablePast
                    value={field.value ? new Date(field.value) : null}
                    onChange={(newValue) => {
                      field.onChange(newValue!.toISOString());
                    }}
                    format="dd-MM-yyyy"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              />
            </Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                {!currentCoupon ? "Create Coupon" : "Save Coupon"}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
