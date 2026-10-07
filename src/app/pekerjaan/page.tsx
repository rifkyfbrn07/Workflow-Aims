import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { getReportPeriods } from "@/services/period-service";
import { PekerjaanClient } from "@/components/features/PekerjaanClient";
import { CheckSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PekerjaanSayaPage() {
  const currentUser = await getCurrentUser();

  const filterOptions = {
    scopeUserId: currentUser?.id,
    scopeRole: currentUser?.role,
    limit: 200,
  };

  const { periods } = await getReportPeriods(filterOptions);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#008651] text-white shadow-xs">
              <CheckSquare className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pekerjaan Saya</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Daftar tugas laporan yang ditugaskan kepada Anda, countdown tenggat waktu, dan submission aktif.
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs font-medium">
          Pengguna Aktif: <strong className="text-slate-900">{currentUser?.name || "User"}</strong> ({currentUser?.department || currentUser?.role || "Umum"})
        </div>
      </div>

      <PekerjaanClient
        tasks={periods as any}
        currentUserName={currentUser?.name}
      />
    </div>
  );
}
