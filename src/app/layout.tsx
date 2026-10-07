import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { Preloader } from "@/components/layout/Preloader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WorkTrack — Sistem Monitoring Jadwal Laporan & Kepatuhan Operasional",
  description: "Enterprise operational reporting and schedule compliance system for Pertamina / Nusantara Regas.",
};

import { ToastProvider } from "@/components/ui/toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans bg-slate-50 text-slate-900 antialiased`}>
        <ToastProvider>
          <Preloader />
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
