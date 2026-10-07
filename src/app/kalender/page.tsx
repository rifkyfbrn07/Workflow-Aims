import React from "react";
import { getReportPeriods } from "@/services/period-service";
import { CalendarView } from "@/components/features/CalendarView";
import { Calendar } from "lucide-react";

export default async function KalenderPage() {
  const { periods } = await getReportPeriods({ limit: 400 });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#008651] text-white shadow-xs">
          <Calendar className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Kalender &amp; Timeline Jadwal</h1>
          <p className="text-xs text-slate-500">
            Visualisasi kalender bulanan batas waktu penyerahan laporan dan cut-off operasional 2026.
          </p>
        </div>
      </div>

      <CalendarView periods={periods as any} />
    </div>
  );
}
