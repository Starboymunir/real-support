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
  dateOfBirth: Yup.date().required(),
  selfAssessmentTaxId: Yup.string().required(),
  nationalInsuranceNumber: Yup.string().required(),
  driverRecognitionNumber: Yup.string().required(),
});

const DriverInfoUpdateForm = ({ id, closeModal, data }) => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const defaultValues = {
    dateOfBirth: data?.dateOfBirth || "",
    selfAssessmentTaxId: data?.selfAssessmentTaxId || "",
    nationalInsuranceNumber: data?.nationalInsuranceNumber || "",
    driverRecognitionNumber: data?.driverRecognitionNumber || "",
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
      const formData = new FormData();

      for (const key in data) {
        if (data[key] !== null && data[key] !== undefined) {
          if (key == "dateOfBirth") {
            formData.append(key, data[key].toISOString());
          } else {
            formData.append(key, data[key]);
          }
        }
      }
      const res = await axios.put(`/api/users/driver/${id}/`, formData);
      if (res.status === 200) {
        delete res?.data?.data?.profileImage;
        setDriverData((prev) => ({
          ...prev,
          ...res?.data?.data,
        }));
        enqueueSnackbar("Driver information updated");
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
        Driver Information Update
      </h1>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
        <div className=" w-full space-y-1">
          <label className="text-white font-semibold">Date of birth</label>
          <RHFTextField
            type="date"
            name="dateOfBirth"
            className="border border-green"
            errors={errors}
            placeholder="Enter Your Date Of Birth"
            control={control}
          />
        </div>
        <div className=" w-full space-y-1">
          <label className="text-white font-semibold">
            Self Assessment Tax ID
          </label>
          <RHFTextField
            type="text"
            name="selfAssessmentTaxId"
            className="border border-green"
            errors={errors}
            placeholder="Enter Your Self Assessment Tax ID"
            control={control}
          />
        </div>
        <div className=" w-full space-y-1">
          <label className="text-white font-semibold">
            National Insurance Number
          </label>
          <RHFTextField
            type="text"
            name="nationalInsuranceNumber"
            className="border border-green"
            errors={errors}
            placeholder="Enter Your National Insurance Number"
            control={control}
          />
        </div>
        <div className=" w-full space-y-1">
          <label className="text-white font-semibold">
            Driver Recognition Number
          </label>
          <RHFTextField
            type="text"
            name="driverRecognitionNumber"
            className="border border-green"
            errors={errors}
            placeholder="Enter Your Driver Recognition Number"
            control={control}
          />
        </div>

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

export default DriverInfoUpdateForm;
