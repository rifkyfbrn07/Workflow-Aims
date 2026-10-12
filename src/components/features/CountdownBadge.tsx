import React from "react";
import { getDeadlineCountdown } from "@/lib/utils";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountdownBadgeProps {
  deadline: Date | string;
  status?: string;
  className?: string;
}

export function CountdownBadge({ deadline, status, className }: CountdownBadgeProps) {
  const cd = getDeadlineCountdown(deadline, status);

  if (["APPROVED", "SUBMITTED", "UNDER_REVIEW"].includes(status || "")) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium", className)}>
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>Selesai</span>
      </span>
    );
  }

  if (cd.isOverdue) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 animate-pulse",
          className
        )}
      >
        <AlertCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
        <span>{cd.text}</span>
      </span>
    );
  }

  if (cd.isToday) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
          className
        )}
      >
        <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        <span>Hari Ini ({cd.text})</span>
      </span>
    );
  }

  if (cd.isUrgent) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-blue-800",
          className
        )}
      >
        <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-sky-400" />
        <span>{cd.text}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-normal",
        className
      )}
    >
      <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
      <span>{cd.text}</span>
    </span>
  );
}
