"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, Info, CheckCircle2, ShieldCheck, X } from "lucide-react";
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
    <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
      <Link href="/dashboard" className="text-slate-900 font-bold hover:text-[#008651] transition-colors">
        WorkTrack
      </Link>
      <span>/</span>
      <span className="text-slate-700 font-semibold">{getBreadcrumbTitle()}</span>
      <span>/</span>
      <span className="text-[#008651] bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200 text-[11px] font-mono">
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
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors shadow-2xs"
        title="Panduan Cut-Off & Tata Kelola Pelaporan"
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogHeader>
          <DialogTitle>Panduan Jadwal &amp; Cut-Off Operasional</DialogTitle>
          <DialogDescription>
            Standar operasional prosedur penyerahan laporan berkala (Distribusi Gas &amp; ORF).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs text-slate-700">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
            <h4 className="font-bold text-[#008651] flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>1. Target Final Draft (Tanggal 2 Bulan Berjalan)</span>
            </h4>
            <p className="text-slate-600 text-[11px]">
              Penyusun laporan wajib menyelesaikan rekonsiliasi data mentah dan draft laporan final untuk disiapkan ke PIC.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 space-y-1">
            <h4 className="font-bold text-[#0055A5] flex items-center gap-1.5">
              <Info className="h-4 w-4" />
              <span>2. Target Submit Berkas (Tanggal 5 Setiap Bulan)</span>
            </h4>
            <p className="text-slate-600 text-[11px]">
              Batas akhir pengunggahan dokumen Excel dan lampiran ke sistem WorkTrack untuk ditinjau oleh PIC.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
            <h4 className="font-bold text-amber-800 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>3. Review &amp; Rapat Koordinasi (Tanggal 12)</span>
            </h4>
            <p className="text-slate-600 text-[11px]">
              PIC dan Reviewer memverifikasi kesesuaian angka laporan sebelum persetujuan (approval) akhir diterbitkan.
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
