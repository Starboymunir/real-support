"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppAvatar } from "../app-components/app-avatar";
import { ProfileSection } from "../app-components/profileSelection";
import { EditPersonalDetailsForm } from "../app-components/Personal-details-form";
import ItemData from "../app-components/item-data";
import { UseFormGetValues, UseFormSetValue } from "react-hook-form";

export function PersonalDetails({
  user,
  getValues,
  setValue,
}: {
  user: any;
  getValues: UseFormGetValues<any>;
  setValue: UseFormSetValue<any>;
}) {
  const router = useRouter();
  const [edit, setEdit] = useState(false);

  return (
    <ProfileSection
      title="Profile"
      className="relative w-full"
      edit={edit ? "Cancel" : "Edit"}
      onEdit={() => {
        setEdit(!edit);
      }}
    >
      {edit ? (
        <EditPersonalDetailsForm
          setValue={setValue}
          getValues={getValues}
          user={user}
          onDone={() => {
            setEdit(false);
            router.refresh();
          }}
        />
      ) : (
        user && (
          <div className="grid gap-5 grid-cols-1  md:grid-cols-profile mt-5 ">
            <AppAvatar
              className="w-full h-full md:row-span-2 flex justify-center items-center overflow-hidden"
              src={user.coverImage ?? ""}
              alt={user.firstName + user.lastName}
              width={130}
              height={130}
            />
            <ItemData title="User ID" data={user.id} />
            <ItemData title="Phone number" data={user.phone_number} />
            <ItemData
              title="Name"
              data={user.firstName + " " + user.lastName}
            />
            <ItemData title="Emil" data={user.emailAddress} />
            <ItemData
              className=" md:col-start-2 md:col-span-2"
              title="Mode"
              data={user.mode}
            />
          </div>
        )
      )}
    </ProfileSection>
  );
}
