"use client";

import { Address, BankAccount, UserAddress } from "@/lib/types";
import Link from "next/link";
import { ProfileSection, ProfileSectionTitle } from "./profile-section";
import { AuthContextType, useAuthContext } from "@/providers/auth-providers";
import { Card } from "../ui/card";

export function AccountDetails(params: { accounts: BankAccount[] }) {
  const { userId }: AuthContextType = useAuthContext();

  const button = () => {
    if (params.accounts.length < 2) {
      return (
        <Link
          href={`/rider/${userId}/profile/accounts/new`}
          className="hover:no-underline text-primary"
        >
          + Add Bank Account
        </Link>
      );
    }
    return "";
  };

  return (
    <Card className="mt-10 p-5">
      <ProfileSectionTitle
        className="ms-3"
        title="My Bank Accounts"
        subtitle="Add your bank account to your profile"
        button={button()}
      />
      <div className="flex flex-col gap-2 mt-5">
        {params.accounts.map((item) => (
          <AccountItem item={item} key={item.id} />
        ))}
        {params.accounts.length == 0 && (
          <div className="h-40 flex items-center justify-center flex-col">
            <p>There are no accounts saved.</p>
            <Link
              href={`/rider/${userId}/profile/accounts/new`}
              className="text-primary"
            >
              + Add Account
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}

export function AccountItem({ item }: { item: BankAccount }) {
  return (
    <ProfileSection
      className="mt-0"
      title={
        <div className="flex items-center gap-3">
          <h1>{item.accountName}</h1>
          {item.isDefault && (
            <small className="text-muted-foreground text-sm">(primary)</small>
          )}
        </div>
      }
      onEdit={`/rider/${item.userId}/profile/accounts/${item.id}`}
    >
      <div className="flex justify-between mt-3">
        <div className="flex gap-4">
          <p className="font-bold ">Account Number: </p>
          <p className="text-muted-foreground">{item.accountNumber}</p>
        </div>
        <div className="flex gap-4">
          <p className="font-bold">Sort Code: </p>
          <p className="text-muted-foreground">{item.sortCode}</p>
        </div>
      </div>
      <div className="flex justify-between mt-3">
        <div className="flex gap-4">
          <p className="font-bold">Postal Code: </p>
          <p className="text-muted-foreground">{item.bankName}</p>
        </div>
        <div className="flex gap-4">
          <p className="font-bold">City: </p>
          <p className="text-muted-foreground">{item.bankName}</p>
        </div>
      </div>
    </ProfileSection>
  );
}
