import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center font-poppins justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary/80",
        primary:
          "bg-gradient-to-br from-primary to-primary-light text-white hover:shadow-lg hover:-translate-y-0.5",
        destructive:
          "bg-red-600 text-white hover:bg-red-700",
        outline:
          "border border-white/20 bg-white/[0.04] text-white hover:bg-white/[0.10] hover:border-white/30",
        secondary:
          "bg-secondary text-white hover:bg-secondary/70",
        ghost: "text-white/70 hover:bg-white/[0.08] hover:text-white",
        link: "text-secondary underline-offset-4 hover:underline",
        blue: "bg-blue text-white hover:bg-blue/80",
        danger: "bg-red-500 text-white underline-offset-4 hover:bg-red-300",
        custom:
          "dark:bg-white dark:text-black bg-black text-white hover:bg-slate-500 dark:hover:bg-slate-300",
        green:
          "bg-gradient-to-br from-secondary to-secondary-light text-white hover:shadow-lg hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        md: "h-10 px-6 py-2.5",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  href?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, href, children, ...props }, ref) => {
    if (href) {
      return (
        <Link href={href} className={cn(buttonVariants({ variant, size, className }))}>
          {children}
        </Link>
      );
    }
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
