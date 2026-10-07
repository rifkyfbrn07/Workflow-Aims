import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center space-y-3 py-12">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#008651]">
        <Loader2 className="h-6 w-6 animate-spin text-[#008651]" />
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-slate-700">Memuat Data Sistem...</p>
        <p className="text-[11px] text-slate-400">Sinkronisasi status dan jadwal operasional</p>
      </div>
    </div>
  );
}
