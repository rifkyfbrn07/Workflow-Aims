"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
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
  ChevronDown,
  LogOut,
  Settings,
  User,
  TableProperties,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { SessionUser } from "@/lib/auth";
import { logoutAction } from "@/actions/worktrack-actions";
import { ROLE_LABELS } from "@/lib/constants";
import Image from "next/image";
import officialLogo from "@/image/WhatsApp Image 2026-10-05 at 13.36.35.jpeg";

interface SidebarProps {
  user: SessionUser | null;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: Array<{ label: string; href: string; icon?: React.ComponentType<{ className?: string }> }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    "Jadwal Kerja": true,
  });

  const isAdmin = user?.role === UserRole.ADMIN;

  const toggleSubmenu = (title: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const navSections: NavSection[] = [
    {
      title: "OPERASIONAL",
      items: [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "Jadwal Kerja",
          href: "/jadwal",
          icon: CalendarDays,
          subItems: [
            { label: "Semua Jadwal (Matriks)", href: "/jadwal", icon: TableProperties },
            { label: "Jadwal Saya", href: "/pekerjaan", icon: CheckSquare },
            { label: "Kalender & Timeline", href: "/kalender", icon: Calendar },
          ],
        },
      ],
    },
    {
      title: "MONITORING & KONTROL",
      items: [
        { label: "Monitoring Kepatuhan", href: "/monitoring", icon: Layers },
        { label: "Submission Hub", href: "/submissions", icon: Send },
        { label: "Pusat Notifikasi", href: "/notifikasi", icon: Bell },
        { label: "Riwayat & Audit Log", href: "/history", icon: History },
      ],
    },
  ];

  if (isAdmin) {
    navSections.push({
      title: "MASTER SISTEM",
      items: [
        { label: "Master Laporan", href: "/master/reports", icon: FileText },
        { label: "Master User", href: "/master/users", icon: Users },
        { label: "Matriks Penugasan", href: "/master/assignments", icon: UserCheck },
      ],
    });
  }

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200 shrink-0 select-none z-20">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 gap-3 border-b border-slate-200/80 bg-white">
        <Image src={officialLogo} alt="Pertamina Nusantara Regas" priority className="h-10 w-10 shrink-0 object-contain" />

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-black tracking-tight text-slate-900">WORKTRACK</h1>
            <span className="text-[9px] bg-emerald-100 text-[#008651] px-1.5 py-0.2 rounded font-bold border border-emerald-200">
              AIMS
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase truncate">
            Distribusi Gas &amp; ORF
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {section.title}
            </p>
            <div className="space-y-0.5 mt-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const hasSub = !!item.subItems && item.subItems.length > 0;
                const isSubOpen = openSubmenus[item.label] ?? false;

                const isMainActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard" || pathname === "/"
                    : pathname.startsWith(item.href);

                if (hasSub) {
                  return (
                    <div key={item.label} className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => toggleSubmenu(item.label)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all duration-150 group relative select-none",
                          isMainActive
                            ? "bg-emerald-50/70 text-[#008651] font-bold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isMainActive && (
                            <motion.span
                              layoutId="activeNavIndicator"
                              className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#008651] rounded-r-full"
                              transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                          )}
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5",
                              isMainActive ? "text-[#008651]" : "text-slate-400 group-hover:text-slate-700"
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 text-slate-400 transition-transform duration-200",
                            isSubOpen ? "rotate-180 text-slate-600" : ""
                          )}
                        />
                      </button>

                      {/* Submenu with height and opacity animation */}
                      <AnimatePresence initial={false}>
                        {isSubOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18, ease: "easeInOut" }}
                            className="overflow-hidden pl-4 pr-1 space-y-0.5"
                          >
                            <div className="border-l border-slate-200/80 ml-2 pl-2.5 py-1 space-y-0.5">
                              {item.subItems?.map((sub) => {
                                const SubIcon = sub.icon || ArrowRight;
                                const isSubActive =
                                  sub.href === "/jadwal"
                                    ? pathname === "/jadwal"
                                    : pathname.startsWith(sub.href);

                                return (
                                  <Link
                                    key={sub.href + sub.label}
                                    href={sub.href}
                                    className={cn(
                                      "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] transition-all duration-150 group",
                                      isSubActive
                                        ? "bg-emerald-50 text-[#008651] font-bold"
                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium"
                                    )}
                                  >
                                    <SubIcon
                                      className={cn(
                                        "h-3 w-3 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5",
                                        isSubActive ? "text-[#008651]" : "text-slate-400 group-hover:text-slate-600"
                                      )}
                                    />
                                    <span className="truncate">{sub.label}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-150 group relative",
                      isMainActive
                        ? "bg-emerald-50 text-[#008651] font-bold shadow-2xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                    )}
                  >
                    {isMainActive && (
                      <motion.span
                        layoutId="activeNavIndicator"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#008651] rounded-r-full"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5",
                        isMainActive ? "text-[#008651]" : "text-slate-400 group-hover:text-slate-700"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom User Profile Section with Dropdown */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/50 relative">
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left shadow-2xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs shrink-0">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-xs font-bold text-slate-800 truncate">
                {user?.name || "Rifky Febrian"}
              </p>
              <p className="text-[10px] text-slate-500 font-medium truncate">
                {user?.department || (user?.role ? ROLE_LABELS[user.role] : "User")}
              </p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200",
              profileOpen ? "rotate-180" : ""
            )}
          />
        </button>

        {/* Profile Popover Menu */}
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-3 right-3 mb-2 rounded-xl border border-slate-200 bg-white shadow-xl z-50 p-2 space-y-1.5"
            >
              <div className="px-2.5 py-1.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-[#008651] border border-emerald-200">
                  {user?.role ? ROLE_LABELS[user.role] : "User"}
                </span>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Logout Keluar</span>
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
