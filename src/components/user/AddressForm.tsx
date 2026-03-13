"use client";

import { Card } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserAddress } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ProfileSectionTitle } from "./ProfileSectionTitle";
import { Form } from "../ui/form";
import { AppInput, AppSwitch } from "@/components/app-components";
import { Button } from "../ui/button";
import { useSnackbar } from "@/components/snackbar";
import Configurations from "@/app/constant/constants";
import { useAuthContext } from "@/providers/auth-providers";
import { createAddress, updateAddress } from "@/server/user";
import { DeleteAddressButton } from "@/app/(webpage)/(authenticated)/rider/[userId]/profile/address/[id]/delete-buuton";
import axiosInstance from "@/lib/axios";

interface AddressFormProps {
  address?: UserAddress;
}

// type NoIdAddress = Omit<UserAddress, "id">;

const userAddressValidator = z.object({
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  houseNumber: z.string().min(1, "House Number is required"),
  streetName: z.string().min(1, "Street Name is required"),
  postalCode: z.string().min(4, "Postal Code is required"),
  isDefault: z.boolean().optional(),
});

export default function AddressForm(props: AddressFormProps) {
  const router = useRouter();
  const { userId, refetchUser } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const form = useForm({
    resolver: zodResolver(userAddressValidator),
    defaultValues: props.address || {
      country: "",
      state: "",
      city: "",
      houseNumber: "",
      streetName: "",
      isDefault: false,
      postalCode: "",
    },
  });

  const onSubmit = form.handleSubmit(async (payload) => {
    try {
      if (props.address) {
        const { data } = await axiosInstance.patch(
          `/user-address/${props.address.id}`,
          {
            ...payload,
            userId: userId as string,
          }
        );

        if (data.success) {
          enqueueSnackbar("Address updated successfully", {
            variant: "success",
          });
          router.replace(`/rider/${userId}/profile/`);
        }
      } else {
        const { data } = await axiosInstance.post(`/user-address`, {
          ...payload,
          userId: userId as string,
        });
        if (data.success) {
          enqueueSnackbar("Address added successfully", { variant: "success" });
        }
        router.replace(`/rider/${userId}/profile/`);
      }
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      refetchUser();
    }
  });

  return (
    <Card className="p-5 mt-10">
      <ProfileSectionTitle
        title={props.address ? "Update your address" : "Add Address"}
        subtitle={`Link your address to ${Configurations.constants.appName}`}
      />
      <Form {...form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-5 mt-10">
          <div className="flex gap-5">
            <AppInput
              form={form}
              name="houseNumber"
              placeholder="House Number"
              itemProps={{ className: "flex-1" }}
            />
            <AppInput
              form={form}
              name="streetName"
              placeholder="StreetName"
              itemProps={{ className: "flex-1" }}
            />
          </div>
          <div className="flex gap-5">
            <AppInput
              form={form}
              name="postalCode"
              placeholder="Postal Code"
              itemProps={{ className: "flex-1" }}
            />
            <AppInput
              form={form}
              name="city"
              placeholder="City"
              itemProps={{ className: "flex-1" }}
            />
          </div>
          <div className="flex gap-5">
            <AppInput
              form={form}
              name="state"
              placeholder="state"
              itemProps={{ className: "flex-1" }}
            />
            <AppInput
              form={form}
              name="country"
              placeholder="Country"
              itemProps={{ className: "flex-1" }}
            />
          </div>

          <AppSwitch
            form={form}
            name="isDefault"
            label={
              <p className="text-l font-semibold text-muted-foreground">
                Make this my primary address
              </p>
            }
          />

          <Button
            type="submit"
            className="self-end"
            disabled={form.formState.isSubmitting}
          >
            Save
          </Button>
        </form>
      </Form>
      <DeleteAddressButton
        id={props.address?.id as string}
        userId={userId as string}
      />
    </Card>
  );
}
