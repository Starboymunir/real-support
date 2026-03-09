"use client";

import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import "react-phone-input-2/lib/style.css";
import { AuthContextType, useAuthContext } from "@/providers/auth-providers";
import {
  TUpdateUserValidator,
  UpdateUserValidator,
} from "@/lib/validators/user-validation";

import { PersonalDetails } from "./PersonalDetails";
import { SocialLinksDetails } from "./social-links-details";
import RemoveAccount from "./RemoveAccount";
import { AccountDetails } from "./AccountDetails";
import AddressDetails from "./AddressDetails";

const UserProfile: React.FC = () => {
  const { user }: AuthContextType = useAuthContext();

  const memoizedValue = useMemo(
    () => ({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      emailAddress: user?.emailAddress || "",
      phone_number: user?.phone_number || "",
    }),
    [user]
  );

  const {
    getValues,
    setValue,
    formState: { errors },
  } = useForm<TUpdateUserValidator>({
    resolver: zodResolver(UpdateUserValidator),
    defaultValues: memoizedValue,
  });

  return (
    <>
      <PersonalDetails user={user!} getValues={getValues} setValue={setValue} />
      <SocialLinksDetails socialLinks={user?.SocialLink || []} />
      <AddressDetails addresses={user?.addressInfo || []} />
      <AccountDetails accounts={user?.bankAccounts || []} />
      <RemoveAccount user={user!} />
    </>
  );
};

export default UserProfile;
