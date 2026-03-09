import { cn } from "@/lib/utils";
import { AllHTMLAttributes } from "react";
import { FieldPath, UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../ui/form";
import { Switch } from "../ui/switch";

interface AppInputProps<T extends Record<string, any>> {
  form: UseFormReturn<T>;

  name: FieldPath<T>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  inputProps?: AllHTMLAttributes<HTMLDivElement>;
}

export default function AppSwitch<T extends Record<string, any>>({
  form,
  name,
  description,
  label,
  inputProps,
}: AppInputProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem
          {...inputProps}
          className={cn("flex items-center gap-3", inputProps?.className)}
        >
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>

          <FormLabel className="!mt-0">{label}</FormLabel>
          {description && <FormDescription>{description}</FormDescription>}
        </FormItem>
      )}
    />
  );
}
