import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { getUserNotifications } from "@/services/notification-service";
import { NotificationDropdown } from "./NotificationDropdown";
import { UserMenu } from "./UserMenu";
import { MobileNav } from "./MobileNav";
import { NavbarBreadcrumb, HelpModalButton } from "./NavbarClient";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export async function Navbar() {
  const user = await getCurrentUser();
  const notifications = user ? await getUserNotifications(user.id, 15) : [];

  const currentDateFormatted = format(new Date(), "dd MMMM yyyy • HH:mm", {
    locale: id,
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 md:px-6 backdrop-blur-md transition-colors">
      {/* Left: Mobile Nav & Dynamic Breadcrumbs */}
      <div className="flex items-center gap-3">
        <MobileNav userRole={user?.role} />
        <NavbarBreadcrumb />
      </div>

      {/* Right: Operational Status, Date, ThemeSwitcher, Help, Notifications & User */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* System Operational Badge */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 px-3 py-1 rounded-full shadow-2xs">
          <span className="flex h-2 w-2 rounded-full bg-[#008651] dark:bg-emerald-400 animate-pulse" />
          <span className="text-slate-800 dark:text-slate-200 font-bold text-[11px]">Operasional Aktif</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">{currentDateFormatted} WIB</span>
        </div>

        {/* Theme Switcher (Light / Dark / System) */}
        <ThemeSwitcher />

        {/* Help & SOP Guide Modal */}
        <HelpModalButton />

        {/* Notifications Dropdown */}
        {user && <NotificationDropdown notifications={notifications as any} />}

        {/* User Profile Dropdown Menu */}
        <UserMenu user={user} />
      </div>
    </header>
  );
}
