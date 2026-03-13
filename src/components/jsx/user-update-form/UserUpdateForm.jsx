import React, { useState } from "react";
import LoadingButton from "@/components/jsx/LoadingButton";
import * as Yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSnackbar } from "notistack";
import RHFTextField from "@/components/jsx/RHFTextField";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const userSchema = Yup.object({
  name: Yup.string().required(),
  email: Yup.string().email("Invalid email format"),
  phone_number: Yup.string().required(),
});

const UserUpdateForm = ({ id, closeModal, data }) => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const defaultValues = {
    name: data?.name || "",
    email: data?.email || "",
    phone_number: data?.phone_number || "",
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues,
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axios.put(`/api/users/${id}/`, data);
      if (res.status === 200) {
        setData((prev) => ({
          ...prev,
          userInfo: { ...prev.userInfo, ...res?.data },
        }));
        enqueueSnackbar("Profile updated");
        closeModal();
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      enqueueSnackbar(error.message, { variant: "error" });
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-2xl font-poppins font-bold text-center mb-10">
        Profile Update
      </h1>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
        <div className="col-span-1 sm:col-span-2 md:col-span-2 place-self-end">
          <LoadingButton
            color="bg-green"
            handleSubmit={handleSubmit(onSubmit)}
            text="Update"
            loading={loading}
          />
        </div>
      </div>
    </form>
  );
};

export default UserUpdateForm;
