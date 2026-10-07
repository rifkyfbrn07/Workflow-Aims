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
          bg: "bg-emerald-50 text-[#008651] border-emerald-200",
          icon: <CheckCircle2 className="h-3 w-3 text-[#008651]" />,
        };
      case "SUBMITTED":
        return {
          label: "Submitted",
          bg: "bg-blue-50 text-[#0055A5] border-blue-200",
          icon: <Send className="h-3 w-3 text-[#0055A5]" />,
        };
      case "UNDER_REVIEW":
        return {
          label: "Under Review",
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          icon: <Clock className="h-3 w-3 text-amber-600" />,
        };
      case "REVISION":
        return {
          label: "Revision",
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          icon: <RotateCcw className="h-3 w-3 text-rose-600" />,
        };
      case "OVERDUE":
        return {
          label: "Overdue",
          bg: "bg-red-50 text-red-700 border-red-200 font-bold",
          icon: <AlertTriangle className="h-3 w-3 text-red-600 animate-pulse" />,
        };
      case "IN_PROGRESS":
        return {
          label: "In Progress",
          bg: "bg-sky-50 text-sky-800 border-sky-200",
          icon: <Clock className="h-3 w-3 text-sky-600" />,
        };
      default:
        return {
          label: "Pending",
          bg: "bg-slate-50 text-slate-600 border-slate-200",
          icon: <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />,
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
        "inline-flex items-center rounded-full border shadow-2xs select-none tracking-tight",
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
