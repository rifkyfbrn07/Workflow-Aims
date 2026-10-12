"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Menu,
  X,
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Calendar,
  Layers,
  Send,
  Bell,
  History,
  Users,
  FileText,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import officialLogo from "@/image/WhatsApp Image 2026-10-05 at 13.36.35.jpeg";

interface MobileNavProps {
  userRole?: UserRole;
}

export function MobileNav({ userRole = UserRole.USER }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isPicOrAdmin = userRole === UserRole.ADMIN || userRole === UserRole.PIC || userRole === UserRole.REVIEWER;

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Jadwal Laporan", href: "/jadwal", icon: CalendarDays },
    { label: "Pekerjaan Saya", href: "/pekerjaan", icon: CheckSquare },
    { label: "Kalender", href: "/kalender", icon: Calendar },
    { label: "Monitoring Kepatuhan", href: "/monitoring", icon: Layers },
    { label: "Submission Hub", href: "/submissions", icon: Send },
    { label: "Pusat Notifikasi", href: "/notifikasi", icon: Bell },
    { label: "Riwayat & Audit Log", href: "/history", icon: History },
  ];

  if (isPicOrAdmin) {
    navItems.push(
      { label: "Master Laporan", href: "/master/reports", icon: FileText },
      { label: "Master User", href: "/master/users", icon: Users },
      { label: "Matriks Penugasan", href: "/master/assignments", icon: UserCheck }
    );
  }

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        aria-label="Buka Menu Navigasi"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-50 flex w-72 flex-col bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 p-4 shadow-2xl border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white p-0.5 border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <Image src={officialLogo} alt="Pertamina Nusantara Regas" priority className="h-full w-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 tracking-tight">NUSANTARA REGAS</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-[#008651] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-mono">
                      AIMS
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Monitoring Operasional</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === "/dashboard" ? pathname === "/" || pathname === "/dashboard" : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all",
                      isActive
                        ? "bg-[#008651] text-white font-semibold shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-400 dark:text-slate-500")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
