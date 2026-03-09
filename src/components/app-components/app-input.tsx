import { HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { FieldPath, UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface AppInputProps<T extends Record<string, any>> {
  form: UseFormReturn<T>;

  name: FieldPath<T>;
  label?: ReactNode;
  description?: string;
  placeholder?: string;

  itemProps?: HTMLAttributes<HTMLDivElement>;

  inputProps?: InputHTMLAttributes<HTMLInputElement> & { className?: string };
}

export default function AppInput<T extends Record<string, any>>({
  form,
  name,
  description,
  label,
  placeholder,
  inputProps,
  itemProps,
}: AppInputProps<T>) {
  const {
    formState: { errors },
  } = form;
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem {...itemProps}>
          {label && <FormLabel className="block mb-4">{label}</FormLabel>}
          <FormControl>
            <Input
              className={`${inputProps?.className ?? ""}`}
              placeholder={placeholder}
              {...inputProps}
              {...field}
              {...(inputProps?.onChange && {
                onChange: (e) => {
                  field.onChange(e);
                  inputProps.onChange!(e);
                },
              })}
            />
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
