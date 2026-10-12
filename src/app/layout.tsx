import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { Preloader } from "@/components/layout/Preloader";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nusantara Regas — Sistem Monitoring Jadwal Laporan & Kepatuhan Operasional",
  description: "Enterprise operational reporting and schedule compliance system for PT Nusantara Regas / Pertamina Group.",
  icons: {
    icon: "/favicon.ico",
  },
};

const themeScript = `
  (function() {
    try {
      var key = 'nr_ops_theme';
      var saved = localStorage.getItem(key);
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'dark' || (!saved && prefersDark) || (saved === 'system' && prefersDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} font-sans bg-background text-foreground antialiased min-h-screen selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300`}>
        <ThemeProvider>
          <ToastProvider>
            <Preloader />
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
