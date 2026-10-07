import React from "react";
import { getReportPeriods } from "@/services/period-service";
import { getProgramMatrixData } from "@/services/dashboard-service";
import { getCurrentUser } from "@/lib/auth";
import { JadwalTableClient } from "@/components/features/JadwalTableClient";
import { ProgramWorkMatrix } from "@/components/features/ProgramWorkMatrix";
import { CalendarDays, Download, Layers, TableProperties } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function JadwalPage() {
  const currentUser = await getCurrentUser();
  const [{ periods }, matrixData] = await Promise.all([
    getReportPeriods({ limit: 400 }),
    getProgramMatrixData(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#008651] text-white shadow-xs">
              <CalendarDays className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Jadwal &amp; Matriks Program Kerja 2026
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Matriks master jadwal laporan bulanan, PIC pelaksana, reviewer, target submit, dan monitoring cut-off operasional.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-medium shadow-2xs">
            Total Matriks: <strong className="text-slate-900">{periods.length}</strong> entri ({matrixData.length} Program)
          </div>
        </div>
      </div>

      {/* 1. 12-Month Matrix View */}
      <ProgramWorkMatrix
        matrixData={matrixData}
        title="Matriks Program Kerja 12 Bulan (Jan – Des 2026)"
        subtitle="Visualisasi jadwal cut-off dan status pelaporan seluruh program kerja per bulan"
      />

      {/* 2. Interactive Searchable Table with Month/PIC/Dept Filters */}
      <div className="pt-2">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Daftar Detail Jadwal per Periode
          </h2>
          <p className="text-xs text-slate-500">
            Pencarian spesifik berdasarkan bulan, departemen, PIC, dan status verifikasi
          </p>
        </div>
        <JadwalTableClient
          periods={periods as any}
          currentUserId={currentUser?.id}
          currentUserRole={currentUser?.role}
        />
      </div>
    </div>
  );
}
