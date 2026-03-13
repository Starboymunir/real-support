import { InputHTMLAttributes, ReactNode } from "react";
import { FieldPath, UseFormReturn } from "react-hook-form";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface AppPhoneNumberInputProps<T extends Record<string, any>> {
  form: UseFormReturn<T>;

  name: FieldPath<T>;
  label?: ReactNode;
  description?: string;
  placeholder?: string;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}

export function AppPhoneNumberInput<T extends Record<string, any>>({
  form,
  name,
  description,
  label,
  placeholder,
  inputProps,
}: AppPhoneNumberInputProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <PhoneInput
            {...inputProps}
            defaultCountry="us"
            placeholder={placeholder}
            value={form.getValues()[name]}
            inputClassName="w-full  "
            onChange={(e) => {
              form.setValue(name, e as any);
            }}
          />
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
