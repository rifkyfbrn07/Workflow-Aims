import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FileQuestion, Home } from "lucide-react";
import officialLogo from "@/image/WhatsApp Image 2026-10-05 at 13.36.35.jpeg";

export default function NotFound() {
  return (
    <div className="flex min-h-[65vh] w-full flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl transition-colors">
        {/* Official Logo in high contrast container */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-white p-1 border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <Image
            src={officialLogo}
            alt="Pertamina Nusantara Regas"
            className="h-full w-full object-contain"
          />
        </div>

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <FileQuestion className="h-6 w-6" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Halaman Tidak Ditemukan (404)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Data atau rute modul operasional yang Anda tuju tidak tersedia atau telah dipindahkan.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-[#008651] hover:bg-[#007244] text-white shadow-xs transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
