import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "./PageTransition";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // If no user session (e.g. login page), render standalone
  if (!user) {
    return <main className="min-h-screen bg-slate-100/70">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
