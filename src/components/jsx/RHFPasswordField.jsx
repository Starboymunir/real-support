import { parseISO, format } from "date-fns";
import React from "react";
import { Controller } from "react-hook-form";
import { Icon } from '@iconify/react';
const RHFPasswordField = ({
  name,
  placeholder,
  errors,
  control,
  className,
  showPassword,
  setShowPassword,
  ...other
}) => {
  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="relative">
            <input
              {...field}
              type={showPassword ? "text" : "password"}
              value={field.value}
              defaultValue={field.value}
              className={`w-full outline-none p-4 rounded-small ${className}`}
              placeholder={placeholder}
              {...other}
            />
            <div className="absolute right-[5%] top-[30%] cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}>
              <Icon icon={showPassword ? "solar:eye-closed-bold" : "solar:eye-bold"} fontSize={20}/>
            </div>
          </div>

        )
        }
      />
      {!!errors[name] && (
        <p className="text-red-500 text-sm font-poppins">{errors[name].message}</p>
      )}
    </>
  );
};

export default RHFPasswordField;