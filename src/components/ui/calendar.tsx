"use client";

import * as React from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      components={{
        Chevron: ({ orientation, ...props }) => {
          switch (orientation) {
            case "up":
              return <ChevronUp className="h-4 w-4" />;
            case "down":
              return <ChevronDown className="h-4 w-4" />;
            case "left":
              return <ChevronLeft className="h-4 w-4" />;
            case "right":
              return <ChevronRight className="h-4 w-4" />;
            default:
              throw new Error('Invalid orientation: "' + orientation + '"');
          }
        },
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
