"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@/lib/types";
import { useForm, UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import AppInput from "./app-input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { AuthContextType, useAuthContext } from "@/providers/auth-providers";
import PhoneInput from "react-phone-input-2";
import AwsImageRender from "@/components/AwsImageRender";
import Image from "next/image";
import { UploadCloudIcon } from "lucide-react";
import { IUser } from "@/types/type";
import { uploadImageFile } from "@/helpers/imageUpload";
import axiosInstance from "@/lib/axios";
import { useSnackbar } from "notistack";

const validationSchema = z.object({
  firstName: z.string().min(2).max(255),
  lastName: z.string().min(2).max(255),
  emailAddress: z.string().min(2).max(255),
  phone_number: z.string().min(9).max(15),
});

export function EditPersonalDetailsForm({
  user,
  onDone,
  getValues,
}: {
  user: User;
  onDone?: () => void;
  getValues: UseFormGetValues<{
    firstName: string;
    lastName: string;
    phone_number: string;
  }>;
  setValue: UseFormSetValue<{
    firstName: string;
    lastName: string;
    phone_number: string;
  }>;
}) {
  const [phone_number, setPhone_number] = useState(getValues()?.phone_number);
  const [uploadImage, setUploadImage] = useState<File | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file: File | null = e.target.files?.[0] ?? null;
    setUploadImage(file);
  };
  const [progress, setProgress] = useState(0);

  const form = useForm<z.infer<typeof validationSchema>>({
    // resolver: zodResolver(validationSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddress,
      phone_number: user.phone_number ?? "",
    },
  });

  const { refetchUser, loading, setLoading }: AuthContextType =
    useAuthContext();

  const onSubmit = form.handleSubmit(async (values) => {
    if (loading) return;
    setLoading(true);
    const formattedPhone = phone_number;
    const phone = phone_number.startsWith("+")
      ? formattedPhone
      : `+${formattedPhone}`;

    let imageUrl = user?.coverImage;

    if (uploadImage) {
      const filename = await uploadImageFile(uploadImage);
      if (filename) {
        imageUrl = filename;
      }
    }

    const payloadData = {
      firstName: values.firstName,
      lastName: values.lastName,
      phone_number: phone,
      emailAddress: values.emailAddress,
      coverImage: imageUrl,
    };

    try {
      const { data } = await axiosInstance.patch(
        `/users/info/${user?.id}`,
        payloadData
      );
      if (data.success) {
        enqueueSnackbar("Profile updated successfully");
      }
    } catch (error) {
      console.log("Error in update User", error);
      if (axios.isAxiosError(error)) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          enqueueSnackbar(error.response.data.message, { variant: "error" });
        } else {
          enqueueSnackbar("An error occurred during update user profile.", {
            variant: "error",
          });
        }
      } else {
        enqueueSnackbar("Non-Axios error:", { variant: "error" });
      }
    } finally {
      setLoading(false);
      refetchUser();
    }
  });

  return (
    <Form {...form}>
      <form className="flex flex-col gap-5 mt-10" onSubmit={onSubmit}>
        {form.formState.isSubmitting && (
          <Progress
            value={progress}
            className="absolute top-0 left-0 w-full h-1"
          />
        )}

        {uploadImage ? (
          <div className="md:p-2 flex justify-center">
            <label
              htmlFor="profileImage"
              className="block text-sm font-medium text-white/70 cursor-pointer hover:text-white"
            >
              <div className="relative ">
                <Image
                  alt="userImage"
                  width={100}
                  height={100}
                  src={URL.createObjectURL(uploadImage)}
                  className="rounded-full p-1"
                />

                <UploadCloudIcon className="absolute right-0 bottom-0" />
              </div>
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/png, image/gif, image/jpeg"
              id="profileImage"
              style={{ display: "none" }}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-sm text-gray-700 uppercase tracking-widest shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-400 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150 mt-2 ml-3"
            />
          </div>
        ) : (
          <div className="md:p-2 flex justifify-center">
            <label
              htmlFor="profileImage"
              className="block text-sm font-medium text-white/70 cursor-pointer hover:text-white"
            >
              <div className="relative ">
                <AwsImageRender
                  width={100}
                  height={100}
                  imageKey={user?.coverImage}
                  alt="profileImage"
                  placeHolderImage="/images/profileImagePlaceholder.jpg"
                />

                <UploadCloudIcon className="absolute right-0 bottom-0" />
              </div>
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/png, image/gif, image/jpeg"
              id="profileImage"
              style={{ display: "none" }}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-sm text-gray-700 uppercase tracking-widest shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-400 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150 mt-2 ml-3"
            />
          </div>
        )}

        <div className="flex gap-5 ">
          <AppInput
            inputProps={{ className: "bg-transparent" }}
            form={form}
            name="firstName"
            label="First Name"
            itemProps={{ className: "flex-1" }}
          />
          <AppInput
            inputProps={{ className: "bg-transparent" }}
            form={form}
            name="lastName"
            label="Last Name"
            itemProps={{ className: "flex-1" }}
          />
        </div>
        <AppInput
          inputProps={{ className: "bg-transparent", disabled: true }}
          form={form}
          name="emailAddress"
          label="Email Address"
          itemProps={{ className: "w-full" }}
        />
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PhoneInput
                  country={"gb"}
                  value={getValues()?.phone_number}
                  onChange={(value) => setPhone_number(value)}
                  inputClass="!relative !outline-none !border !border-input !px-4 py-3 !ps-24 !rounded-sm !h-full !w-full !bg-transparent "
                  buttonClass="!absolute !top-0 !bottom-0 !left-0 !w-[80px] !grid !place-content-center !rounded-tl-sm !rounded-bl-sm !border !border-input !bg-transparent "
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="self-end px-20"
          disabled={form.formState.isSubmitting}
        >
          Update
        </Button>
      </form>
    </Form>
  );
}
