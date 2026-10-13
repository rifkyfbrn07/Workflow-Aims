"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, Info, CheckCircle2, ShieldCheck } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function NavbarBreadcrumb() {
  const pathname = usePathname();

  const getBreadcrumbTitle = () => {
    if (pathname === "/" || pathname === "/dashboard") return "Dashboard";
    if (pathname.startsWith("/jadwal")) return "Jadwal Kerja";
    if (pathname.startsWith("/pekerjaan")) return "Pekerjaan Saya";
    if (pathname.startsWith("/kalender")) return "Kalender & Timeline";
    if (pathname.startsWith("/monitoring")) return "Monitoring Kepatuhan";
    if (pathname.startsWith("/submissions")) return "Submission Hub";
    if (pathname.startsWith("/notifikasi")) return "Pusat Notifikasi";
    if (pathname.startsWith("/history")) return "Riwayat & Audit Log";
    if (pathname.startsWith("/master/reports")) return "Master Laporan";
    if (pathname.startsWith("/master/users")) return "Master User";
    if (pathname.startsWith("/master/assignments")) return "Matriks Penugasan";
    return "Workspace";
  };

  return (
    <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
      <Link href="/dashboard" className="text-slate-900 dark:text-slate-100 font-bold hover:text-[#008651] dark:hover:text-emerald-400 transition-colors">
        Nusantara Regas
      </Link>
      <span className="text-slate-400 dark:text-slate-600">/</span>
      <span className="text-slate-700 dark:text-slate-300 font-semibold">{getBreadcrumbTitle()}</span>
      <span className="text-slate-400 dark:text-slate-600">/</span>
      <span className="text-[#0055A5] dark:text-sky-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded font-bold border border-blue-200 dark:border-blue-800 text-[11px] font-mono">
        2026
      </span>
    </div>
  );
}

export function HelpModalButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
        title="Panduan Cut-Off & Tata Kelola Pelaporan"
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogHeader>
          <DialogTitle>Panduan Jadwal &amp; Cut-Off Operasional</DialogTitle>
          <DialogDescription>
            Standar operasional prosedur penyerahan laporan berkala PT Nusantara Regas (Distribusi Gas &amp; ORF).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs text-slate-700 dark:text-slate-300">
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
            <h4 className="font-bold text-[#008651] dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>1. Target Final Draft (Tanggal 2 Bulan Berjalan)</span>
            </h4>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Penyusun laporan wajib menyelesaikan rekonsiliasi data operasional dan draft laporan final untuk diserahkan ke PIC.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-1">
            <h4 className="font-bold text-[#0055A5] dark:text-sky-400 flex items-center gap-1.5">
              <Info className="h-4 w-4" />
              <span>2. Target Submit Berkas (Tanggal 5 Setiap Bulan)</span>
            </h4>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              Batas akhir pengunggahan dokumen Excel dan berkas pendukung ke portal sistem operasional Nusantara Regas untuk ditinjau oleh PIC.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1">
            <h4 className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>3. Review &amp; Rapat Koordinasi (Tanggal 12)</span>
            </h4>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              PIC dan Reviewer memverifikasi kesesuaian angka laporan operasional sebelum persetujuan resmi (approval) diterbitkan.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="pertamina" size="sm" onClick={() => setIsOpen(false)}>
            Mengerti
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
