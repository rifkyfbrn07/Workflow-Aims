"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error in server/browser console without leaking secrets to the UI
    console.error("Operational Application Error:", error.message);
  }, [error]);

  return (
    <div className="flex min-h-[65vh] w-full flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl transition-colors">
        {/* Official Nusantara Regas Logo */}
        <div className="mx-auto flex justify-center">
          <BrandLogo className="h-14 w-14 shadow-sm border border-slate-200/80 dark:border-slate-700" priority />
        </div>

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/60">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Terjadi Kendala Memuat Data Operasional
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Sistem tidak dapat memproses permintaan saat ini. Silakan coba muat ulang atau kembali ke dashboard utama.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <Button
            onClick={() => reset()}
            variant="pertamina"
            className="w-full sm:w-auto text-xs font-bold bg-[#008651] hover:bg-[#007244] text-white inline-flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Coba Lagi (Retry)</span>
          </Button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>

        {error.digest && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono pt-3 border-t border-slate-100 dark:border-slate-800">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
