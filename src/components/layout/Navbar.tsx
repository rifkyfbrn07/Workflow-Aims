import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { getUserNotifications } from "@/services/notification-service";
import { NotificationDropdown } from "./NotificationDropdown";
import { UserMenu } from "./UserMenu";
import { MobileNav } from "./MobileNav";
import { NavbarBreadcrumb, HelpModalButton } from "./NavbarClient";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export async function Navbar() {
  const user = await getCurrentUser();
  const notifications = user ? await getUserNotifications(user.id, 15) : [];

  const currentDateFormatted = format(new Date(), "dd MMMM yyyy • HH:mm", {
    locale: id,
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 md:px-6 backdrop-blur-md">
      {/* Left: Mobile Nav & Dynamic Breadcrumbs */}
      <div className="flex items-center gap-3">
        <MobileNav userRole={user?.role} />
        <NavbarBreadcrumb />
      </div>

      {/* Right: Operational Status, Date, Help, Notifications & User */}
      <div className="flex items-center gap-2.5 md:gap-3.5">
        {/* System Operational Badge */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
          <span className="flex h-2 w-2 rounded-full bg-[#008651] animate-pulse" />
          <span className="text-slate-800 font-bold text-[11px]">System Operational</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 text-[11px] font-mono">{currentDateFormatted} WIB</span>
        </div>

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
