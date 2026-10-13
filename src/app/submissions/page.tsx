import React from "react";
import Link from "next/link";
import { getSubmissionArchive } from "@/services/submission-service";
import { getCurrentUser } from "@/lib/auth";
import { scopeWhere } from "@/lib/submission-access";
import { SubmissionFilters } from "@/components/features/SubmissionFilters";
import { StatusBadge } from "@/components/features/StatusBadge";
import { formatDateTimeIndo } from "@/lib/utils";
import {
  Send,
  FileSpreadsheet,
  CheckCircle2,
  RotateCcw,
  Clock,
  ExternalLink,
  User,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SubmissionsHubPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const currentUser = await getCurrentUser();
  const query = await searchParams;
  if (!currentUser) return null;
  const archive = await getSubmissionArchive({ scope: scopeWhere(currentUser), search: query.search, status: query.status as any, month: Number(query.month) || undefined, year: Number(query.year) || undefined, page: Number(query.page) || 1, limit: 20 });
  const submissions = archive.items;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0055A5] text-white shadow-xs">
              <Send className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Submission Hub</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Seluruh riwayat penyerahan laporan (Excel, berkas, dan lampiran) dari setiap departemen.
          </p>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg shadow-2xs font-medium">
          Total Submission: <strong className="text-slate-900 dark:text-slate-100">{archive.total}</strong> berkas
        </div>
      </div>

      <SubmissionFilters />

      {/* Submissions Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 dark:bg-[#1E293B] text-white font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4 min-w-[200px]">Laporan &amp; Periode</th>
                <th className="py-3 px-3 min-w-[150px]">Nama Berkas / File</th>
                <th className="py-3 px-3 min-w-[120px]">Disubmit Oleh</th>
                <th className="py-3 px-3 min-w-[120px]">Waktu Submit</th>
                <th className="py-3 px-3 min-w-[100px]">Status</th>
                <th className="py-3 px-3 min-w-[130px]">Reviewer</th>
                <th className="py-3 px-3 text-right min-w-[90px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="font-medium">Belum ada data submission.</p>
                  </td>
                </tr>
              ) : (
                submissions.map((sub, idx) => {
                  const report = sub.reportPeriod.assignment.report;
                  const period = sub.reportPeriod;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400 font-mono">
                        {(archive.page - 1) * archive.limit + idx + 1}
                      </td>

                      <td className="py-3 px-4">
                        <Link
                          href={`/pekerjaan/${period.id}`}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-[#0055A5] block leading-snug transition-colors"
                        >
                          {report.name}
                        </Link>
                        <span className="text-[11px] text-[#0055A5] dark:text-blue-400 font-semibold">
                          {period.periodLabel} (v{sub.version})
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[180px]">
                          {sub.fileName}
                        </span>
                        {(sub.blobUrl || sub.fileUrl) && (
                          <a
                            href={`/api/submissions/${sub.id}/download`}
                            className="text-[10px] text-[#0055A5] dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>Secure download</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                          {sub.submittedBy.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {sub.submittedBy.department || "SPBD"}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        {formatDateTimeIndo(sub.submittedAt)}
                      </td>

                      <td className="py-3 px-3">
                        <StatusBadge status={sub.status} size="sm" />
                      </td>

                      <td className="py-3 px-3">
                        {sub.reviewedBy ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">
                              {sub.reviewedBy.name}
                            </span>
                            {sub.reviewNotes && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 italic line-clamp-1">
                                &quot;{sub.reviewNotes}&quot;
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum direview</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Link href={`/pekerjaan/${period.id}`} className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-[#0055A5] hover:text-white text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors">
                            View
                          </Link>
                          {(sub.blobUrl || sub.fileUrl) && (
                            <a href={`/api/submissions/${sub.id}/download`} className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/40 hover:bg-[#0055A5] hover:text-white text-[#0055A5] dark:text-blue-400 font-semibold text-xs transition-colors">
                              Download
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {archive.total > archive.limit && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Showing {(archive.page - 1) * archive.limit + 1}–{Math.min(archive.page * archive.limit, archive.total)} of {archive.total}</span>
          <div className="flex gap-2">
            {archive.page > 1 && (
              <Link className="rounded border border-slate-200 dark:border-slate-800 px-3 py-1.5" href={`/submissions?${new URLSearchParams({ ...query, page: String(archive.page - 1) })}`}>
                Previous
              </Link>
            )}
            {archive.page * archive.limit < archive.total && (
              <Link className="rounded border border-slate-200 dark:border-slate-800 px-3 py-1.5" href={`/submissions?${new URLSearchParams({ ...query, page: String(archive.page + 1) })}`}>
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
