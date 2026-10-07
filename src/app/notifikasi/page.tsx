import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUserNotifications } from "@/services/notification-service";
import { formatDateTimeIndo } from "@/lib/utils";
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Send,
  CheckCheck,
  RefreshCw,
  ArrowRight,
  Shield,
  Calendar,
} from "lucide-react";
import {
  markNotificationReadFormAction,
  markAllNotificationsReadFormAction,
  triggerDeadlineCheckFormAction,
} from "@/actions/worktrack-actions";
import { Button } from "@/components/ui/button";
import { isToday, isYesterday } from "date-fns";

export default async function NotifikasiPage() {
  const currentUser = await getCurrentUser();
  const notifications = currentUser
    ? await getUserNotifications(currentUser.id, 50)
    : [];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "OVERDUE":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "DEADLINE_TODAY":
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      case "DEADLINE_SOON":
        return <Clock className="h-4 w-4 text-[#0055A5]" />;
      case "SUBMITTED":
        return <Send className="h-4 w-4 text-blue-600" />;
      case "REVISION":
        return <RotateCcw className="h-4 w-4 text-rose-600" />;
      case "APPROVED":
        return <CheckCircle2 className="h-4 w-4 text-[#008651]" />;
      default:
        return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  // Group notifications by Today, Yesterday, Earlier
  const todayNotifs = notifications.filter((n) => isToday(new Date(n.sentAt)));
  const yesterdayNotifs = notifications.filter((n) => isYesterday(new Date(n.sentAt)));
  const earlierNotifs = notifications.filter(
    (n) => !isToday(new Date(n.sentAt)) && !isYesterday(new Date(n.sentAt))
  );

  const renderGroup = (title: string, items: typeof notifications) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 px-1">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h2>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
            {items.length}
          </span>
        </div>

        <div className="space-y-2.5">
          {items.map((n) => {
            const isUnread = !n.read;
            const period = n.reportPeriod;

            return (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                  isUnread
                    ? "bg-emerald-50/20 border-emerald-200/80 shadow-2xs"
                    : "bg-white border-slate-200 shadow-2xs"
                }`}
              >
                <div className="mt-0.5 p-2 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-900">{n.title}</h3>
                      {n.escalationLevel > 1 && (
                        <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-red-100 text-red-700 border border-red-200">
                          Eskalasi Level {n.escalationLevel}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {formatDateTimeIndo(n.sentAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                  <div className="pt-2 flex items-center justify-between gap-3 text-xs">
                    {period ? (
                      <Link
                        href={`/pekerjaan/${period.id}`}
                        className="font-bold text-[#0055A5] hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Buka {period.assignment.report.name} ({period.periodLabel})</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    ) : (
                      <span />
                    )}

                    {isUnread && (
                      <form action={markNotificationReadFormAction}>
                        <input type="hidden" name="notificationId" value={n.id} />
                        <button
                          type="submit"
                          className="text-[11px] text-slate-500 hover:text-slate-800 font-medium underline"
                        >
                          Tandai dibaca
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#008651] text-white shadow-2xs">
              <Bell className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pusat Notifikasi &amp; Reminder</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengingat tenggat waktu operasional (H-3, H-1, Hari H, Overdue) dan status persetujuan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <form action={triggerDeadlineCheckFormAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#008651]" />
              <span>Cek Reminder Sekarang</span>
            </button>
          </form>

          {unreadCount > 0 && (
            <form action={markAllNotificationsReadFormAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#008651] hover:bg-[#007244] text-white shadow-xs transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Tandai Semua Dibaca ({unreadCount})</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Notifications List Grouped */}
      <div className="space-y-6">
        {notifications.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <Bell className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-slate-700">Tidak ada notifikasi saat ini.</p>
            <p className="text-xs text-slate-400 mt-1">
              Pengingat deadline akan muncul otomatis ketika mendekati jadwal cut-off.
            </p>
          </div>
        ) : (
          <>
            {renderGroup("Hari Ini", todayNotifs)}
            {renderGroup("Kemarin", yesterdayNotifs)}
            {renderGroup("Sebelumnya", earlierNotifs)}
          </>
        )}
      </div>
    </div>
  );
}
