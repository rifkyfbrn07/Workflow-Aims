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
import { BrandLogo } from "@/components/ui/BrandLogo";

interface MobileNavProps {
  userRole?: UserRole;
}

export function MobileNav({ userRole = UserRole.USER }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = userRole === UserRole.ADMIN;

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Jadwal Kerja", href: "/jadwal", icon: CalendarDays },
    { label: "Pekerjaan Saya", href: "/pekerjaan", icon: CheckSquare },
    { label: "Kalender & Timeline", href: "/kalender", icon: Calendar },
    { label: "Monitoring Kepatuhan", href: "/monitoring", icon: Layers },
    { label: "Submission Hub", href: "/submissions", icon: Send },
    { label: "Pusat Notifikasi", href: "/notifikasi", icon: Bell },
    { label: "Riwayat & Audit Log", href: "/history", icon: History },
  ];

  if (isAdmin) {
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
                <BrandLogo className="h-9 w-9 shrink-0 shadow-2xs border border-slate-200 dark:border-slate-700" priority />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 tracking-tight">NUSANTARA REGAS</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-[#0055A5] dark:text-sky-400 border border-blue-200 dark:border-blue-800 font-mono">
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
                        ? "bg-[#0055A5] text-white font-semibold shadow-xs"
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
