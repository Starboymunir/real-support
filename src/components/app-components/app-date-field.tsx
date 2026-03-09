import { HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { FieldPath, UseFormReturn } from "react-hook-form";


import { format } from "date-fns";

import { FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
//
// import { Calendar } from "../ui/calendar";
import { Calendar} from "primereact/calendar"

interface AppDateInput<T extends Record<string, any>> {
  form: UseFormReturn<T>;

  name: FieldPath<T>;
  label?: ReactNode;
  description?: string;
  placeholder?: string;

  itemProps?: HTMLAttributes<HTMLDivElement>;

  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}

export default function AppDateInput<T extends Record<string, any>>({
  form,
  name,
  description,
  label,
  placeholder,
  inputProps,
  itemProps,
}: AppDateInput<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem {...itemProps}>
          {label && <FormLabel className="block mb-4">{label}</FormLabel>}
          <Calendar
            formatDateTime={(d) => format(d, "PPP")}
            className="block w-full relative"
            appendTo={"self"}
            panelClassName="bg-card p-3 border-border border-[1px] rounded-md"
            inputClassName="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={field.value}
            onChange={(e) => {
              field.onChange(e.value);
            }}
          />

          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
