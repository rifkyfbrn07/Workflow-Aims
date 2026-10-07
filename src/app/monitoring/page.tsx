import React from "react";
import { getReportPeriods } from "@/services/period-service";
import { MonitoringMatrixClient } from "@/components/features/MonitoringMatrixClient";
import { Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MonitoringPage() {
  const { periods } = await getReportPeriods({ limit: 400 });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#008651] text-white shadow-xs">
          <Layers className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Monitoring Kepatuhan &amp; Progres Operasional
          </h1>
          <p className="text-xs text-slate-500">
            Pemantauan status laporan seluruh departemen dengan indikator On Time, Due Soon, dan Overdue.
          </p>
        </div>
      </div>

      <MonitoringMatrixClient periods={periods as any} />
    </div>
  );
}
