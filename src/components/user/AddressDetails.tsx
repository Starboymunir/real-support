"use client";

import { UserAddress } from "@/lib/types";
import Link from "next/link";
import { ProfileSection, ProfileSectionTitle } from "./profile-section";
import { AuthContextType, useAuthContext } from "@/providers/auth-providers";
import { Card } from "../ui/card";

const AddressDetails = (params: { addresses: UserAddress[] }) => {
  const { userId }: AuthContextType = useAuthContext();

  const button = () => {
    if (params.addresses.length < 2) {
      return (
        <Link
          href={`/rider/${userId}/profile/address/new`}
          className="hover:no-underline text-primary"
        >
          + Add Address
        </Link>
      );
    }
    return "";
  };

  return (
    <Card className="mt-10 p-5">
      <ProfileSectionTitle
        className="ms-3"
        title="My Addresses"
        subtitle="Add your address to your profile"
        button={button()}
      />
      <div className="flex flex-col gap-2 mt-5">
        {params.addresses.map((item) => (
          <AddressItem item={item} key={item.id} />
        ))}
        {params.addresses.length == 0 && (
          <div className="h-40 flex items-center justify-center flex-col">
            <p>There are no addresses saved.</p>
            <Link
              href={`/rider/${userId}/profile/address/new`}
              className="text-primary"
            >
              + Add Address
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AddressDetails;

const AddressItem = ({ item }: { item: UserAddress }) => {
  return (
    <ProfileSection
      className="mt-0"
      title={
        <div className="flex items-center gap-3">
          <h1>{item.streetName}</h1>
          {item.isDefault && (
            <small className="text-muted-foreground text-sm">(primary)</small>
          )}
        </div>
      }
      onEdit={`/rider/${item.userId}/profile/address/${item.id}`}
    >
      <div className="flex justify-between mt-3">
        <div className="flex gap-4">
          <p className="font-bold ">House Number: </p>
          <p className="text-muted-foreground">{item.houseNumber}</p>
        </div>
        <div className="flex gap-4">
          <p className="font-bold">Street Name: </p>
          <p className="text-muted-foreground">{item.streetName}</p>
        </div>
      </div>
      <div className="flex justify-between mt-3">
        <div className="flex gap-4">
          <p className="font-bold">Postal Code: </p>
          <p className="text-muted-foreground">{item.postalCode}</p>
        </div>
        <div className="flex gap-4">
          <p className="font-bold">City: </p>
          <p className="text-muted-foreground">{item.city}</p>
        </div>
      </div>
      <div className="flex justify-between mt-3">
        <div className="flex gap-4">
          <p className="font-bold">Locality: </p>
          <p className="text-muted-foreground">{item.state}</p>
        </div>
        <div className="flex gap-4">
          <p className="font-bold">Country: </p>
          <p className="text-muted-foreground">{item.country}</p>
        </div>
      </div>
    </ProfileSection>
  );
};
