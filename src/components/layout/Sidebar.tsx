"use client";

import React, { useState, useRef, useEffect } from "react";
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
import { BrandLogo } from "@/components/ui/BrandLogo";

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
  const profileRef = useRef<HTMLDivElement>(null);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    "Jadwal Kerja": true,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [profileOpen]);

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
    <aside className="hidden lg:flex lg:flex-col fixed inset-y-0 top-0 bottom-0 left-0 w-64 h-screen max-h-screen overflow-hidden bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 select-none z-40 transition-colors">
      {/* Brand Header */}
      <div className="h-16 shrink-0 flex items-center px-4 gap-3 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        <BrandLogo className="h-10 w-10 shrink-0" priority />

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xs font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">NUSANTARA REGAS</h1>
            <span className="text-[9px] bg-blue-50 dark:bg-blue-950/60 text-[#0055A5] dark:text-sky-400 px-1.5 py-0.2 rounded font-bold border border-blue-200 dark:border-blue-800 font-mono">
              AIMS
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wide uppercase truncate">
            Distribusi Gas &amp; ORF
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5 overscroll-contain">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <p className="px-3 text-[9.5px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
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
                            ? "bg-slate-100/70 dark:bg-slate-800/60 text-[#0055A5] dark:text-sky-400 font-bold"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 font-medium"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
                              isMainActive ? "text-[#0055A5] dark:text-sky-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200",
                            isSubOpen ? "rotate-180 text-slate-600 dark:text-slate-300" : ""
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
                            className="overflow-hidden pl-3 pr-1 space-y-0.5"
                          >
                            <div className="border-l-2 border-slate-200/80 dark:border-slate-800 ml-2 pl-2.5 py-1 space-y-0.5">
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
                                      "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] transition-all duration-150 group relative",
                                      isSubActive
                                        ? "bg-blue-50 dark:bg-blue-950/60 text-[#0055A5] dark:text-sky-300 font-bold"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 font-medium"
                                    )}
                                  >
                                    {isSubActive && (
                                      <motion.span
                                        layoutId="activeSubNavIndicator"
                                        className="absolute -left-[13px] top-1.5 bottom-1.5 w-0.5 bg-[#0055A5] dark:bg-sky-400 rounded-full"
                                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                                      />
                                    )}
                                    <SubIcon
                                      className={cn(
                                        "h-3 w-3 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5",
                                        isSubActive ? "text-[#0055A5] dark:text-sky-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
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
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-150 group relative select-none",
                      isMainActive
                        ? "bg-blue-50/90 dark:bg-blue-950/50 text-[#0055A5] dark:text-sky-300 font-bold shadow-2xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-medium"
                    )}
                  >
                    {isMainActive && (
                      <motion.span
                        layoutId="activeNavIndicator"
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#0055A5] dark:bg-sky-400 rounded-r-full shadow-xs"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
                        isMainActive ? "text-[#0055A5] dark:text-sky-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200"
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
      <div className="shrink-0 p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 relative" ref={profileRef}>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="w-full flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left shadow-2xs"
          aria-expanded={profileOpen}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs shrink-0">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {user?.name || "Rekan Kerja"}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                {user?.department || (user?.role ? ROLE_LABELS[user.role] : "User")}
              </p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200",
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
              className="absolute bottom-full left-3 right-3 mb-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50 p-2 space-y-1.5"
            >
              <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user?.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">{user?.email}</p>
                <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/50 text-[#008651] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {user?.role ? ROLE_LABELS[user.role] : "User"}
                </span>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors font-semibold"
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
