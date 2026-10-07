import React from "react";
import { getAllReports } from "@/services/report-service";
import { MasterReportsClient } from "@/components/features/MasterReportsClient";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MasterReportsPage() {
  const reports = await getAllReports();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#008651] text-white shadow-xs">
          <FileText className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Master Data Pekerjaan &amp; Laporan</h1>
          <p className="text-xs text-slate-500">
            Katalog master jenis laporan berkala, frekuensi cut-off, dan departemen operasional.
          </p>
        </div>
      </div>

      <MasterReportsClient initialReports={reports as any} />
    </div>
  );
}
