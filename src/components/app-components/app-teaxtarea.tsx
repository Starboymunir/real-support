import { HTMLAttributes, ReactNode } from "react";
import { FieldPath, UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";


interface AppInputProps<T extends Record<string, any>> {
  form: UseFormReturn<T>;

  name: FieldPath<T>;
  label?: ReactNode;
  description?: string;
  placeholder?: string;

  itemProps?: HTMLAttributes<HTMLDivElement>;

  inputProps?: HTMLAttributes<HTMLTextAreaElement>;
}

export default function AppTextarea<T extends Record<string, any>>({
  form,
  name,
  description,
  label,
  placeholder,
  inputProps,
  itemProps,
}: AppInputProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem {...itemProps}>
          {label && <FormLabel className="block mb-4">{label}</FormLabel>}
          <FormControl>
            <Textarea placeholder={placeholder} {...inputProps} {...field} />
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
