import React from "react";
import Link from "next/link";
import { getActivityLogs } from "@/services/activity-service";
import { getAllSubmissions } from "@/services/submission-service";
import { StatusBadge } from "@/components/features/StatusBadge";
import { formatDateTimeIndo } from "@/lib/utils";
import {
  History,
  FileSpreadsheet,
  CheckCircle2,
  RotateCcw,
  Clock,
  Send,
  UserCheck,
  Building2,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HistoryAuditPage() {
  const [activities, submissions] = await Promise.all([
    getActivityLogs({ limit: 60 }),
    getAllSubmissions({ limit: 40 }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
              <History className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Riwayat Aktivitas &amp; Audit Trail
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekam jejak seluruh aktivitas sistem: penugasan, pengerjaan, pengiriman file, permintaan revisi, dan persetujuan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Complete Activity Log Stream */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#0055A5]" />
              <span>Log Aktivitas Sistem (Real-Time)</span>
            </h2>
            <span className="text-xs text-slate-400">{activities.length} Entri</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto pr-1">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">Belum ada catatan aktivitas.</p>
            ) : (
              activities.map((act) => {
                const meta = (act.metadata as any) || {};

                return (
                  <div key={act.id} className="py-3 flex items-start gap-3 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-white font-bold text-xs shrink-0 mt-0.5">
                      {(act.user?.name || "S").charAt(0).toUpperCase()}
                    </div>

                    <div className="space-y-0.5 flex-1 min-w-0 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 truncate">
                          {act.user?.name || "Sistem"}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {formatDateTimeIndo(act.createdAt)}
                        </span>
                      </div>

                      <p className="text-slate-600 leading-snug">
                        <span className="font-semibold text-slate-800">
                          {act.action === "TASK_SUBMITTED" && "Submit pekerjaan"}
                          {act.action === "TASK_RESUBMITTED" && "Submit ulang (revisi)"}
                          {act.action === "TASK_APPROVED" && "Menyetujui (Approved) laporan"}
                          {act.action === "REVISION_REQUESTED" && "Meminta revisi laporan"}
                          {act.action === "TASK_STARTED" && "Mulai mengerjakan"}
                          {act.action === "TASK_ASSIGNED" && "Menugaskan laporan baru"}
                          {act.action === "REPORT_CREATED" && "Membuat master laporan"}
                          {act.action === "USER_CREATED" && "Menambahkan user baru"}
                        </span>
                        {meta.reportName && ` "${meta.reportName}"`}
                        {meta.periodLabel && ` (${meta.periodLabel})`}
                      </p>

                      {meta.reviewNotes && (
                        <p className="text-[11px] text-rose-700 bg-rose-50 p-1.5 rounded border border-rose-200 mt-1 italic">
                          Catatan: &quot;{meta.reviewNotes}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Submission Versioning Trail */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-purple-600" />
              <span>Riwayat Berkas &amp; Versi</span>
            </h2>
            <span className="text-xs text-slate-400">{submissions.length} Berkas</span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 truncate max-w-[200px]">
                    {sub.reportPeriod.assignment.report.name}
                  </span>
                  <StatusBadge status={sub.status} size="sm" />
                </div>

                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>
                    {sub.reportPeriod.periodLabel} (v{sub.version})
                  </span>
                  <span>{formatDateTimeIndo(sub.submittedAt)}</span>
                </div>

                <div className="font-mono text-slate-700 text-[11px] truncate">
                  📄 {sub.fileName}
                </div>

                {sub.reviewedBy && (
                  <div className="text-[11px] pt-1 border-t border-slate-200/60 text-slate-500">
                    Direview oleh <strong>{sub.reviewedBy.name}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
