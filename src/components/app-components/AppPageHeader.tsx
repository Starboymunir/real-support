import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface AuthHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  button?: ReactNode;
  className?: string;
}

export function AppPageHeader({
  title,
  subtitle,
  className,
  button,
}: AuthHeaderProps) {
  return (
    <div className={cn("relative", className)}>
      <h1 className="text-2xl font-bold font-sans dark:text-gray-100">
        {title}
      </h1>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      {button && (
        <div className={"absolute right-0 top-0 bottom-0"}>{button}</div>
      )}
    </div>
  );
}
