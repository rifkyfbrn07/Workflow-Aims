"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { CountdownBadge } from "./CountdownBadge";
import { SubmitModal } from "./SubmitModal";
import { formatDateIndo, formatDateTimeIndo } from "@/lib/utils";
import {
  CheckSquare,
  Clock,
  Send,
  Play,
  ArrowRight,
  User,
  Calendar,
  AlertCircle,
  FileCheck,
  RotateCcw,
  Search,
  Filter,
  Eye,
  FileSpreadsheet,
} from "lucide-react";
import { startWorkAction } from "@/actions/worktrack-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";

interface TaskItem {
  id: string;
  periodLabel: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  deadlineSubmit: Date | string;
  deadlineFinal?: Date | string | null;
  status: string;
  assignment: {
    id: string;
    targetSubmit?: string | null;
    targetFinal?: string | null;
    meetingDate?: string | null;
    report: {
      id: string;
      name: string;
      description?: string | null;
      code?: string | null;
      frequency: string;
    };
    user: {
      id: string;
      name: string;
      department?: string | null;
    };
    pic?: {
      id: string;
      name: string;
    } | null;
    reviewer?: {
      id: string;
      name: string;
    } | null;
  };
  submissions?: Array<{
    id: string;
    version: number;
    fileName: string;
    notes?: string | null;
    reviewNotes?: string | null;
    status: string;
  }>;
}

interface PekerjaanClientProps {
  tasks: TaskItem[];
  currentUserName?: string;
}

export function PekerjaanClient({ tasks, currentUserName }: PekerjaanClientProps) {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [submitTask, setSubmitTask] = useState<TaskItem | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);

  const handleStartWork = async (periodId: string) => {
    setStartingId(periodId);
    try {
      await startWorkAction(periodId);
    } finally {
      setStartingId(null);
    }
  };

  // Unique months in user's assigned tasks
  const uniqueMonths = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => set.add(t.periodLabel));
    return Array.from(set);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Month
      if (selectedMonth !== "ALL" && t.periodLabel !== selectedMonth) {
        return false;
      }

      // Tab
      if (activeTab === "PENDING" && t.status !== "PENDING") return false;
      if (activeTab === "IN_PROGRESS" && t.status !== "IN_PROGRESS") return false;
      if (activeTab === "SUBMITTED" && t.status !== "SUBMITTED") return false;
      if (activeTab === "UNDER_REVIEW" && t.status !== "UNDER_REVIEW") return false;
      if (activeTab === "REVISION" && t.status !== "REVISION") return false;
      if (activeTab === "APPROVED" && t.status !== "APPROVED") return false;
      if (activeTab === "OVERDUE" && t.status !== "OVERDUE") return false;

      // Search
      if (search.trim()) {
        const s = search.toLowerCase();
        const rName = t.assignment.report.name.toLowerCase();
        const code = (t.assignment.report.code || "").toLowerCase();
        const pic = (t.assignment.pic?.name || "").toLowerCase();
        return rName.includes(s) || code.includes(s) || pic.includes(s);
      }

      return true;
    });
  }, [tasks, activeTab, selectedMonth, search]);

  const counts = useMemo(() => {
    return {
      all: tasks.length,
      pending: tasks.filter((t) => t.status === "PENDING").length,
      inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      submitted: tasks.filter((t) => t.status === "SUBMITTED").length,
      underReview: tasks.filter((t) => t.status === "UNDER_REVIEW").length,
      revision: tasks.filter((t) => t.status === "REVISION").length,
      approved: tasks.filter((t) => t.status === "APPROVED").length,
      overdue: tasks.filter((t) => t.status === "OVERDUE").length,
    };
  }, [tasks]);

  return (
    <div className="space-y-4">
      {/* Search & Month Filter Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama laporan, kode, atau PIC..."
              className="pl-9 text-xs h-9 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Periode:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-48 h-9 px-3 text-xs rounded-md border border-slate-200 bg-white font-semibold text-slate-800 focus:ring-1 focus:ring-[#008651]"
            >
              <option value="ALL">Semua Periode (2026)</option>
              {uniqueMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          {[
            { label: "Semua", value: "ALL", count: counts.all },
            { label: "Belum Dikerjakan", value: "PENDING", count: counts.pending },
            { label: "In Progress", value: "IN_PROGRESS", count: counts.inProgress },
            { label: "Submitted", value: "SUBMITTED", count: counts.submitted },
            { label: "Under Review", value: "UNDER_REVIEW", count: counts.underReview },
            { label: "Perlu Revisi", value: "REVISION", count: counts.revision, isWarning: counts.revision > 0 },
            { label: "Selesai (Approved)", value: "APPROVED", count: counts.approved },
            { label: "Terlambat", value: "OVERDUE", count: counts.overdue, isDanger: counts.overdue > 0 },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === tab.value
                  ? "bg-[#008651] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === tab.value
                    ? "bg-[#006837] text-white"
                    : tab.isDanger
                    ? "bg-red-100 text-red-700"
                    : tab.isWarning
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-200/80 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Modern Operational Work Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4 min-w-[220px]">Pekerjaan / Laporan</th>
                <th className="py-3 px-3 min-w-[110px]">Periode</th>
                <th className="py-3 px-3 min-w-[140px]">Batas Waktu (Deadline)</th>
                <th className="py-3 px-3 min-w-[100px]">PIC</th>
                <th className="py-3 px-3 min-w-[120px]">Status</th>
                <th className="py-3 px-3 text-right min-w-[160px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4">
                    <EmptyState
                      title="Tidak ada pekerjaan yang sesuai"
                      description="Silakan ubah tab kategori status atau reset kata kunci pencarian Anda."
                      onClearFilter={() => {
                        setActiveTab("ALL");
                        setSearch("");
                        setSelectedMonth("ALL");
                      }}
                    />
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t, idx) => {
                  const isApproved = t.status === "APPROVED";
                  const isPending = t.status === "PENDING";
                  const isRevision = t.status === "REVISION";

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50 transition-colors border-b border-slate-100"
                    >
                      <td className="py-3 px-3 text-center text-slate-400 font-mono">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4">
                        <Link
                          href={`/pekerjaan/${t.id}`}
                          className="font-bold text-slate-900 hover:text-[#008651] block leading-snug"
                        >
                          {t.assignment.report.name}
                        </Link>
                        {t.assignment.report.code && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {t.assignment.report.code}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {t.periodLabel}
                      </td>

                      <td className="py-3 px-3 space-y-0.5">
                        <div className="font-semibold text-slate-900">
                          {formatDateIndo(t.deadlineSubmit)} • 17:00
                        </div>
                        <CountdownBadge deadline={t.deadlineSubmit} status={t.status} />
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-800">
                        {t.assignment.pic?.name || "-"}
                      </td>

                      <td className="py-3 px-3">
                        <StatusBadge status={t.status} size="sm" />
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <button
                              onClick={() => handleStartWork(t.id)}
                              disabled={startingId === t.id}
                              className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 border border-slate-200"
                              title="Tandai mulai dikerjakan"
                            >
                              <Play className="h-3 w-3 text-[#0055A5]" />
                              <span>Mulai</span>
                            </button>
                          )}

                          {!isApproved && (
                            <button
                              onClick={() => setSubmitTask(t)}
                              className="px-2.5 py-1 rounded text-xs font-bold bg-[#008651] hover:bg-[#007244] text-white shadow-2xs transition-colors flex items-center gap-1"
                              title="Unggah berkas laporan"
                            >
                              <Send className="h-3 w-3" />
                              <span>{isRevision ? "Revisi" : "Submit"}</span>
                            </button>
                          )}

                          <Link
                            href={`/pekerjaan/${t.id}`}
                            className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                            title="Buka detail"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
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

      {/* Submit Modal */}
      {submitTask && (
        <SubmitModal
          open={Boolean(submitTask)}
          onOpenChange={(open) => !open && setSubmitTask(null)}
          periodId={submitTask.id}
          reportName={submitTask.assignment.report.name}
          periodLabel={submitTask.periodLabel}
          versionNumber={(submitTask.submissions?.length || 0) + 1}
        />
      )}
    </div>
  );
}
