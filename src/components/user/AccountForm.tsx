"use client";

import { Card } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { BankAccount, UserAddress } from "@/types/prisma-types";
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
import { DeleteAddressButton } from "@/app/(webpage)/(authenticated)/rider/[userId]/profile/address/[id]/delete-buuton";
import axiosInstance from "@/lib/axios";
import { useBankAccountQuery } from "@/hooks/Users";
import { useEffect } from "react";

interface AccountFormProps {
  id?: string;
}

const userAccountValidator = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountName: z.string().min(1, "Account name is required"),
  accountNumber: z.string().min(6, "Account number is required"),
  sortCode: z.string().min(1, "Sort code is required"),
  isDefault: z.boolean().optional(),
});

export default function AccountForm(props: AccountFormProps) {
  const router = useRouter();
  const { userId, refetchUser } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();

  const {data: account} = useBankAccountQuery(props?.id as string);
  
  const defaultValues = account || {
    bankName: "",
    accountName: "",
    accountNumber: "",
    sortCode: "",
    isDefault: false,
  };

  const form = useForm({
    resolver: zodResolver(userAccountValidator),
    defaultValues,
  });

  useEffect(() => {
    if (account) {
      form.reset(account);
    }
  }, [account]);

  const onSubmit = form.handleSubmit(async (payload) => {
    try {
      if (account) {
        const { data } = await axiosInstance.patch(
          `/accounts/${account.id}`,
          {
            ...payload,
            userId: userId as string,
          }
        );

        if (data.success) {
          enqueueSnackbar("Address updated successfully");
          router.replace(`/rider/${userId}/profile/`);
        }
      } else {
        const { data } = await axiosInstance.post(`/accounts`, {
          ...payload,
          userId: userId as string,
        });

        if (data.success) {
          enqueueSnackbar("Address added successfully");
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
        title={account ? "Update your Account" : "Add Account"}
        subtitle={`Link your Account to ${Configurations.constants.appName}`}
      />
      <Form {...form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-5 mt-10">
          <div className="flex gap-5">
            <AppInput
              form={form}
              name="bankName"
              placeholder="Bank Name"
              itemProps={{ className: "flex-1" }}
            />
            <AppInput
              form={form}
              name="accountName"
              placeholder="Account Name"
              itemProps={{ className: "flex-1" }}
            />
          </div>
          <div className="flex gap-5">
            <AppInput
              form={form}
              name="accountNumber"
              placeholder="Account Number"
              itemProps={{ className: "flex-1" }}
            />
            <AppInput
              form={form}
              name="sortCode"
              placeholder="Sort Code"
              itemProps={{ className: "flex-1" }}
            />
          </div>

          <AppSwitch
            form={form}
            name="isDefault"
            label={
              <p className="text-l font-semibold text-muted-foreground">
                Make this my primary Account
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
        id={account?.id as string}
        userId={userId as string}
      />
    </Card>
  );
}
