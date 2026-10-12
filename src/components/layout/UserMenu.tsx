"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, LogOut, ChevronDown } from "lucide-react";
import { SessionUser } from "@/lib/auth";
import { logoutAction } from "@/actions/worktrack-actions";
import { ROLE_LABELS } from "@/lib/constants";

interface UserMenuProps {
  user: SessionUser | null;
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "PIC":
        return "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "REVIEWER":
        return "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "MANAGEMENT":
        return "bg-emerald-100 dark:bg-emerald-950/40 text-[#008651] dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  if (!user) {
    return (
      <a
        href="/login"
        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#008651] text-white hover:bg-[#007244] shadow-xs transition-colors"
      >
        Login Masuk
      </a>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left shadow-2xs"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 dark:bg-slate-700 text-white font-bold text-xs">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:block leading-tight">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{user.name}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">{user.department || user.role}</p>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User Info */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 rounded-t-xl">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user.name}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{user.email}</p>
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRoleBadgeColor(
                  user.role
                )}`}
              >
                {ROLE_LABELS[user.role] || user.role}
              </span>
              {user.department && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 rounded font-medium">
                  {user.department}
                </span>
              )}
            </div>
          </div>

          {/* Logout Action */}
          <div className="p-1.5">
            <form action={logoutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar Akun (Logout)</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
