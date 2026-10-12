import React from "react";
import { getPeriodStatusConfig } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, RotateCcw, Send, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  showIcon?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({
  status,
  showIcon = true,
  className,
  size = "md",
}: StatusBadgeProps) {
  const getBadgeStyle = () => {
    switch (status) {
      case "APPROVED":
        return {
          label: "Approved",
          bg: "bg-emerald-50 dark:bg-emerald-950/40 text-[#008651] dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
          icon: <CheckCircle2 className="h-3 w-3 text-[#008651] dark:text-emerald-400" />,
        };
      case "SUBMITTED":
        return {
          label: "Submitted",
          bg: "bg-blue-50 dark:bg-blue-950/40 text-[#0055A5] dark:text-sky-400 border-blue-200 dark:border-blue-800",
          icon: <Send className="h-3 w-3 text-[#0055A5] dark:text-sky-400" />,
        };
      case "UNDER_REVIEW":
        return {
          label: "Under Review",
          bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
          icon: <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />,
        };
      case "REVISION":
        return {
          label: "Revision",
          bg: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
          icon: <RotateCcw className="h-3 w-3 text-rose-600 dark:text-rose-400" />,
        };
      case "OVERDUE":
        return {
          label: "Overdue",
          bg: "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 font-bold",
          icon: <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400 animate-pulse" />,
        };
      case "IN_PROGRESS":
        return {
          label: "In Progress",
          bg: "bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800",
          icon: <Clock className="h-3 w-3 text-sky-600 dark:text-sky-400" />,
        };
      default:
        return {
          label: "Pending",
          bg: "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
          icon: <div className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />,
        };
    }
  };

  const badge = getBadgeStyle();
  const sizeClass =
    size === "sm"
      ? "text-[10px] px-2 py-0.5 gap-1 font-semibold"
      : size === "lg"
      ? "text-xs px-3 py-1 gap-1.5 font-bold"
      : "text-[11px] px-2.5 py-0.5 gap-1.5 font-semibold";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border shadow-2xs select-none tracking-tight transition-colors",
        badge.bg,
        sizeClass,
        className
      )}
    >
      {showIcon && badge.icon}
      <span>{badge.label}</span>
    </span>
  );
}
