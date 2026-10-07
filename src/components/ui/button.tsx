import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.99]",
  {
    variants: {
      variant: {
        default: "bg-[#008651] text-white hover:bg-[#007244] shadow-xs",
        pertamina: "bg-[#008651] text-white hover:bg-[#007244] shadow-xs",
        primary: "bg-[#008651] text-white hover:bg-[#007244] shadow-xs",
        blue: "bg-[#0055A5] text-white hover:bg-[#00478B] shadow-xs",
        corporate: "bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-xs",
        destructive: "bg-[#DC2626] text-white hover:bg-[#B91C1C] shadow-xs",
        outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs",
        secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200/80",
        ghost: "hover:bg-slate-100 text-slate-700",
        link: "text-[#008651] underline-offset-4 hover:underline",
        success: "bg-[#008651] text-white hover:bg-[#007244] shadow-xs",
        warning: "bg-[#D97706] text-white hover:bg-[#B45309] shadow-xs",
      },
      size: {
        default: "h-9 px-3.5 py-1.5",
        sm: "h-8 rounded-md px-2.5 text-xs",
        lg: "h-10 rounded-md px-5 text-sm",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "pertamina",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
