"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { formatDateTimeIndo } from "@/lib/utils";
import { markNotificationReadAction, markAllNotificationsReadAction, triggerDeadlineCheckAction } from "@/actions/worktrack-actions";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  sentAt: Date | string;
  reportPeriod?: {
    id: string;
    periodLabel: string;
    assignment?: {
      report?: {
        name: string;
      };
    };
  } | null;
}

interface NotificationDropdownProps {
  notifications: NotificationItem[];
}

export function NotificationDropdown({ notifications }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationReadAction(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsReadAction();
  };

  const handleSyncDeadlines = async () => {
    setSyncing(true);
    await triggerDeadlineCheckAction();
    setSyncing(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "OVERDUE":
        return <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case "DEADLINE_TODAY":
        return <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case "DEADLINE_SOON":
        return <Clock className="h-4 w-4 text-[#0055A5] dark:text-sky-400" />;
      case "SUBMITTED":
        return <Send className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case "REVISION":
        return <RotateCcw className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
      case "APPROVED":
        return <CheckCircle2 className="h-4 w-4 text-[#008651] dark:text-emerald-400" />;
      default:
        return <Bell className="h-4 w-4 text-slate-500 dark:text-slate-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors shadow-2xs"
        title="Notifikasi & Reminder"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 rounded-t-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Notifikasi</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 px-2 py-0.2 text-[10px] font-semibold">
                  {unreadCount} belum dibaca
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleSyncDeadlines}
                disabled={syncing}
                title="Cek deadline & reminder sekarang"
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin text-blue-600" : ""}`} />
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] text-[#0055A5] dark:text-sky-400 hover:text-blue-800 font-medium px-1.5 py-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-950/30 flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" />
                  <span>Tandai Semua</span>
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p>Belum ada notifikasi.</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && handleMarkAsRead(n.id)}
                  className={`p-3 text-xs flex items-start gap-2.5 transition-colors cursor-pointer ${
                    n.read
                      ? "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400"
                      : "bg-blue-50/40 dark:bg-blue-950/30 hover:bg-blue-50/70 dark:hover:bg-blue-950/50 text-slate-900 dark:text-slate-100 font-medium"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">{n.title}</p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 font-mono">
                        {formatDateTimeIndo(n.sentAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                  {!n.read && <div className="h-1.5 w-1.5 rounded-full bg-[#0055A5] dark:bg-sky-400 mt-1.5 shrink-0" />}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-xl text-center">
            <Link
              href="/notifikasi"
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#0055A5] dark:text-sky-400 hover:underline font-semibold"
            >
              Lihat Seluruh Notifikasi &amp; Reminder →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
