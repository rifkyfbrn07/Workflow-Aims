import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInDays, differenceInHours, differenceInMinutes, isPast, parseISO } from "date-fns";
import { id } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateIndo(date: Date | string | null | undefined, formatStr = "dd MMM yyyy"): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return format(d, formatStr, { locale: id });
}

export function formatDateTimeIndo(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  return format(d, "dd MMM yyyy • HH:mm", { locale: id });
}

export interface CountdownInfo {
  text: string;
  isOverdue: boolean;
  isToday: boolean;
  isUrgent: boolean; // < 24h
  days: number;
  hours: number;
}

export function getDeadlineCountdown(deadline: Date | string, status?: string): CountdownInfo {
  const target = typeof deadline === "string" ? new Date(deadline) : deadline;
  const now = new Date();

  if (["APPROVED", "SUBMITTED", "UNDER_REVIEW"].includes(status || "")) {
    return {
      text: "Selesai",
      isOverdue: false,
      isToday: false,
      isUrgent: false,
      days: 0,
      hours: 0,
    };
  }

  const diffMs = target.getTime() - now.getTime();
  const isPassed = diffMs < 0;
  const absDiffHours = Math.abs(differenceInHours(target, now));
  const absDiffDays = Math.abs(differenceInDays(target, now));
  const isToday = !isPassed && absDiffHours < 24 && target.getDate() === now.getDate();

  if (isPassed) {
    if (absDiffHours < 24) {
      return {
        text: `Terlambat ${absDiffHours} jam`,
        isOverdue: true,
        isToday: false,
        isUrgent: true,
        days: 0,
        hours: absDiffHours,
      };
    }
    return {
      text: `Terlambat ${absDiffDays} hari`,
      isOverdue: true,
      isToday: false,
      isUrgent: true,
      days: absDiffDays,
      hours: absDiffHours,
    };
  }

  if (absDiffHours <= 1) {
    const mins = Math.max(1, differenceInMinutes(target, now));
    return {
      text: `${mins} menit lagi`,
      isOverdue: false,
      isToday: true,
      isUrgent: true,
      days: 0,
      hours: 0,
    };
  }

  if (absDiffHours < 24) {
    return {
      text: `${absDiffHours} jam lagi`,
      isOverdue: false,
      isToday: true,
      isUrgent: true,
      days: 0,
      hours: absDiffHours,
    };
  }

  return {
    text: `${absDiffDays} hari lagi`,
    isOverdue: false,
    isToday: false,
    isUrgent: absDiffDays <= 2,
    days: absDiffDays,
    hours: absDiffHours,
  };
}

export interface StatusConfig {
  label: string;
  labelEn: string;
  variant: "default" | "secondary" | "destructive" | "outline" | "warning" | "success" | "purple" | "blue" | "gray";
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotClass: string;
}

export function getPeriodStatusConfig(status: string): StatusConfig {
  switch (status) {
    case "PENDING":
      return {
        label: "Belum Dikerjakan",
        labelEn: "Pending",
        variant: "gray",
        bgClass: "bg-slate-100 text-slate-700",
        textClass: "text-slate-700",
        borderClass: "border-slate-200",
        dotClass: "bg-slate-400",
      };
    case "IN_PROGRESS":
      return {
        label: "Sedang Dikerjakan",
        labelEn: "In Progress",
        variant: "blue",
        bgClass: "bg-blue-50 text-blue-700",
        textClass: "text-blue-700",
        borderClass: "border-blue-200",
        dotClass: "bg-blue-500",
      };
    case "SUBMITTED":
      return {
        label: "Sudah Submit",
        labelEn: "Submitted",
        variant: "purple",
        bgClass: "bg-purple-50 text-purple-700",
        textClass: "text-purple-700",
        borderClass: "border-purple-200",
        dotClass: "bg-purple-500",
      };
    case "UNDER_REVIEW":
      return {
        label: "Menunggu Review",
        labelEn: "Under Review",
        variant: "warning",
        bgClass: "bg-amber-50 text-amber-800",
        textClass: "text-amber-800",
        borderClass: "border-amber-200",
        dotClass: "bg-amber-500",
      };
    case "REVISION":
      return {
        label: "Perlu Revisi",
        labelEn: "Revision",
        variant: "destructive",
        bgClass: "bg-rose-50 text-rose-700",
        textClass: "text-rose-700",
        borderClass: "border-rose-200",
        dotClass: "bg-rose-500",
      };
    case "APPROVED":
      return {
        label: "Disetujui",
        labelEn: "Approved",
        variant: "success",
        bgClass: "bg-emerald-50 text-emerald-700",
        textClass: "text-emerald-700",
        borderClass: "border-emerald-200",
        dotClass: "bg-emerald-500",
      };
    case "OVERDUE":
      return {
        label: "Terlambat",
        labelEn: "Overdue",
        variant: "destructive",
        bgClass: "bg-red-50 text-red-700",
        textClass: "text-red-700",
        borderClass: "border-red-200",
        dotClass: "bg-red-600 animate-pulse",
      };
    default:
      return {
        label: status,
        labelEn: status,
        variant: "gray",
        bgClass: "bg-gray-100 text-gray-700",
        textClass: "text-gray-700",
        borderClass: "border-gray-200",
        dotClass: "bg-gray-400",
      };
  }
}

export function getNotificationTypeConfig(type: string) {
  switch (type) {
    case "DEADLINE_TODAY":
      return {
        label: "Deadline Hari Ini",
        icon: "AlertCircle",
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
      };
    case "DEADLINE_SOON":
      return {
        label: "Mendekati Deadline",
        icon: "Clock",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      };
    case "OVERDUE":
      return {
        label: "Pekerjaan Terlambat",
        icon: "AlertTriangle",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      };
    case "SUBMITTED":
      return {
        label: "Submission Diterima",
        icon: "FileCheck",
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
      };
    case "REVISION":
      return {
        label: "Permintaan Revisi",
        icon: "RotateCcw",
        color: "text-rose-600",
        bgColor: "bg-rose-50",
        borderColor: "border-rose-200",
      };
    case "APPROVED":
      return {
        label: "Pekerjaan Disetujui",
        icon: "CheckCircle2",
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
      };
    default:
      return {
        label: "Pengingat",
        icon: "Bell",
        color: "text-slate-600",
        bgColor: "bg-slate-50",
        borderColor: "border-slate-200",
      };
  }
}
