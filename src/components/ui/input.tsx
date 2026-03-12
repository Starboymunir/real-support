import * as React from "react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, icon: Icon, ...props }, ref) => {
    if (label || Icon) {
      return (
        <div className="w-full">
          {label && (
            <label className="block text-sm font-medium text-white mb-1.5">
              {label}
            </label>
          )}
          <div className="relative">
            {Icon && (
              <Icon
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
              />
            )}
            <input
              type={type}
              className={cn(
                "w-full py-3.5 px-4.5 border-[1.5px] border-white/10 rounded-xl bg-white/[0.04] text-white text-[0.95rem] transition-all duration-250 placeholder:text-white/35 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_4px_rgba(0,230,118,0.08)] focus:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50",
                Icon && "pl-11",
                className
              )}
              ref={ref}
              {...props}
            />
          </div>
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
export default Input
