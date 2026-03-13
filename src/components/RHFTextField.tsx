import {
  Controller,
  Control,
  FieldValues,
  UseFormReset,
} from "react-hook-form";

interface RHFTextFieldProps {
  name: string;
  type: string;
  placeholder?: string;
  errors: Record<string, any>;
  control: Control<FieldValues>;
  reset: UseFormReset<FieldValues>;
  className?: string;
}

const RHFTextField: React.FC<RHFTextFieldProps> = ({
  name,
  type,
  placeholder,
  errors,
  control,
  reset,
  className,
  ...other
}) => {
  return (
    <>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            {...field}
            type={type}
            value={
              type === "date" && field.value
                ? field.value.split("T")[0]
                : field.value
            }
            defaultValue={
              type === "date" && field.value
                ? field.value.split("T")[0]
                : field.value
            }
            className={`w-full outline-none p-4 rounded-small ${className}`}
            placeholder={placeholder}
            {...other}
          />
        )}
      />
      {!!errors[name] && (
        <p className="text-red-500 text-sm font-poppins">
          {errors[name].message}
        </p>
      )}
    </>
  );
};

export default RHFTextField;
