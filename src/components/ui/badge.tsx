import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow hover:bg-slate-800",
        secondary: "border-transparent bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700",
        destructive: "border-red-200 dark:border-red-800/80 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400",
        outline: "text-foreground border-slate-200 dark:border-slate-800",
        success: "border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 text-[#008651] dark:text-emerald-400",
        warning: "border-amber-200 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300",
        info: "border-blue-200 dark:border-blue-800/80 bg-blue-50 dark:bg-blue-950/40 text-[#0055A5] dark:text-sky-400",
        purple: "border-purple-200 dark:border-purple-800/80 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300",
        gray: "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
