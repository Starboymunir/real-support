"use client";

import { User } from "@/lib/types";
import React, { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSnackbar } from "@/components/snackbar";
import {
  deleteUser,
  resetPassword,
  type ResetPasswordOutput,
  confirmResetPassword,
  type ConfirmResetPasswordInput,
} from "aws-amplify/auth";
import {
  RemoveAccountFormSchema,
  RemoveAccountOTPSchema,
  TRemoveAccountFormSchema,
  TRemoveAccountOTPSchema,
} from "@/lib/validators/wallet-validator";
import { Tabs, TabsContent } from "../ui/tabs";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getUser } from "@/server/user";

type TabType = "form" | "confirmation";

const RemoveAccount = ({ user }: { user: User }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [currentTab, setCurrentTab] = useState<TabType>("form");
  const [loading, setLoading] = useState(false);

  // Separate form handling for email step
  const {
    register: emailRegister,
    handleSubmit: handleEmailSubmit,
    setError: setEmailError,
    formState: { errors: emailErrors, isSubmitting: isEmailSubmitting },
    reset: resetEmail,
  } = useForm<TRemoveAccountFormSchema>({
    resolver: zodResolver(RemoveAccountFormSchema),
  });

  // Separate form handling for OTP step
  const {
    register: otpRegister,
    handleSubmit: handleOTPSubmit,
    formState: { errors: otpErrors, isSubmitting: isOtpSubmitting },
  } = useForm<TRemoveAccountOTPSchema>({
    resolver: zodResolver(RemoveAccountOTPSchema),
  });

  async function handleResetPassword(username: string) {
    try {
      const output = await resetPassword({ username });

      handleResetPasswordNextSteps(output);
    } catch (error: any) {
      console.log(error);
      enqueueSnackbar(error.message, { variant: "error" });
    }
  }

  function handleResetPasswordNextSteps(output: ResetPasswordOutput) {
    const { nextStep } = output;
    switch (nextStep.resetPasswordStep) {
      case "CONFIRM_RESET_PASSWORD_WITH_CODE":
        const codeDeliveryDetails = nextStep.codeDeliveryDetails;
        console.log(
          `Confirmation code was sent to ${codeDeliveryDetails.deliveryMedium}`
        );
        enqueueSnackbar("Confirmation code was sent to email", {
          variant: "success",
        });
        setCurrentTab("confirmation");
        break;
      case "DONE":
        console.log("Successfully reset password.");
        enqueueSnackbar("Successfully reset password", { variant: "success" });
        break;
    }
  }

  const onNext = async (values: TRemoveAccountFormSchema) => {
    setLoading(true);
    try {
      const user = await getUser(values.email);
      if (!user) {
        setEmailError("email", { message: "User not found" });
        return;
      }
      await handleResetPassword(user.emailAddress);
    } catch (err) {
      enqueueSnackbar("Something went wrong", { variant: "error" });
    } finally {
      setLoading(false);
      resetEmail();
    }
  };

  async function handleConfirmResetPassword({
    username,
    confirmationCode,
    newPassword,
  }: ConfirmResetPasswordInput) {
    try {
      await confirmResetPassword({
        username,
        confirmationCode,
        newPassword,
      });
      handleDeleteUser();
    } catch (error: any) {
      enqueueSnackbar(error.message, { variant: "error" });
    }
  }

  async function handleDeleteUser() {
    try {
      await deleteUser();
      enqueueSnackbar("Account removed successfully", { variant: "success" });
    } catch (error) {
      console.log(error);
    }
  }

  const onProcessed = async (values: TRemoveAccountOTPSchema) => {
    setLoading(true);
    try {
      await handleConfirmResetPassword({
        username: user?.emailAddress,
        confirmationCode: values.otp,
        newPassword: "User!Deleted@123",
      });
    } catch (err) {
      enqueueSnackbar("Failed to remove account", { variant: "error" });
    } finally {
      setLoading(false);
      resetEmail();
    }
  };

  return (
    <Card className="mt-10 p-5">
      <p className="text-xl font-semibold text-center text-red-600">
        Remove My Account
      </p>
      <Tabs
        value={currentTab}
        className="w-full flex flex-col items-center my-10"
      >
        {/* Email Form */}
        <form
          className="w-full flex flex-col gap-4"
          onSubmit={handleEmailSubmit(onNext)}
        >
          <TabsContent value="form" className="flex w-full items-center gap-5">
            <div className="flex flex-col flex-grow gap-5">
              <Label className="font-semibold">Email Address*</Label>
              <Input
                {...emailRegister("email")}
                placeholder="Email Address"
                className={cn("w-full outline-none p-4 rounded-sm", {
                  "focus-visible:ring-red-500": emailErrors?.email,
                })}
              />
              {emailErrors?.email && (
                <p className="text-red-500 text-sm">
                  {emailErrors?.email?.message}
                </p>
              )}
            </div>
            <Button
              className="bg-black mt-4 text-xs dark:bg-white dark:hover:bg-slate-300 hover:bg-slate-900 flex justify-center w-1/5"
              type="submit"
              disabled={isEmailSubmitting || loading}
            >
              Next
              <ArrowRight size={15} className="ml-3 text-xs" />
            </Button>
          </TabsContent>
        </form>

        {/* OTP Form */}
        <form
          className="w-full flex flex-col gap-4"
          onSubmit={handleOTPSubmit(onProcessed)}
        >
          <TabsContent
            value="confirmation"
            className="flex w-full flex-col items-center gap-5"
          >
            <div className="flex flex-col w-full gap-5">
              <Label className="font-semibold">OTP*</Label>
              <Input
                {...otpRegister("otp")}
                placeholder="6 digit OTP"
                className={cn("w-full outline-none p-4 rounded-sm", {
                  "focus-visible:ring-red-500": otpErrors?.otp,
                })}
              />
              {otpErrors?.otp && (
                <p className="text-red-500 text-sm">
                  {otpErrors?.otp?.message}
                </p>
              )}
            </div>
            <div className="w-full flex gap-2 mt-4">
              <Button
                variant={"destructive"}
                className="w-2/4 my-4 text-xs flex justify-center"
                onClick={() => setCurrentTab("form")}
              >
                <ArrowLeft size={15} className="mr-3 text-xs" />
                Go Back
              </Button>
              <Button
                variant={"default"}
                className="w-2/4 my-4 text-xs flex justify-center"
                type="submit"
                disabled={isOtpSubmitting || loading}
              >
                Confirm
              </Button>
            </div>
          </TabsContent>
        </form>
      </Tabs>
    </Card>
  );
};

export default RemoveAccount;
