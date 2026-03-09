"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

export const ProfileSection = ({
  children,
  title,
  subtitle,
  onEdit,
  edit = "Edit",
  className,
}: {
  children?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: string;
  className?: string;
  edit?: React.ReactNode;
  onEdit?: (() => void) | string;
}) => {
  return (
    <Card className={cn("p-8 mt-10", className)}>
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-sans">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        {!edit ? null : typeof onEdit == "string" ? (
          <Link href={onEdit} className="text-primary">
            {edit}
          </Link>
        ) : (
          <Button
            variant="link"
            onClick={onEdit}
            className="hover:no-underline"
          >
            {edit}
          </Button>
        )}
      </div>
      {children}
    </Card>
  );
};

export const ProfileSectionTitle = (props: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  button?: React.ReactNode;
  className?: string;
}) => {
  const { button, className, subtitle, title } = props;
  return (
    <div className={cn("flex justify-between", className)}>
      <div>
        <h1 className="text-2xl font-semibold font-sans">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      {button}
    </div>
  );
};
