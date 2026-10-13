"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { CountdownBadge } from "./CountdownBadge";
import { SubmitModal } from "./SubmitModal";
import { ReviewModal } from "./ReviewModal";
import { formatDateIndo, formatDateTimeIndo } from "@/lib/utils";
import { MONTH_NAMES } from "@/lib/constants";
import {
  Search,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Eye,
  Send,
  RotateCcw,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PeriodItem {
  id: string;
  periodLabel: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  deadlineFinal?: Date | string | null;
  deadlineSubmit: Date | string;
  meetingDate?: Date | string | null;
  planDate?: string | null;
  actualDate?: string | null;
  status: string;
  assignment: {
    id: string;
    targetFinal?: string | null;
    targetSubmit?: string | null;
    meetingDate?: string | null;
    report: {
      id: string;
      name: string;
      code?: string | null;
      frequency: string;
      defaultDepartment?: string | null;
    };
    user: {
      id: string;
      name: string;
      email: string;
      department?: string | null;
    };
    pic?: {
      id: string;
      name: string;
      email: string;
    } | null;
    reviewer?: {
      id: string;
      name: string;
      email: string;
    } | null;
  };
  submissions?: Array<{
    id: string;
    version: number;
    fileName: string;
    fileUrl?: string | null;
    notes?: string | null;
    status: string;
    submittedAt: Date | string;
    submittedBy: {
      name: string;
      department?: string | null;
    };
  }>;
}

interface JadwalTableClientProps {
  periods: PeriodItem[];
  currentUserId?: string;
  currentUserRole?: string;
}

export function JadwalTableClient({
  periods,
  currentUserId,
  currentUserRole,
}: JadwalTableClientProps) {
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [selectedPic, setSelectedPic] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Modals state
  const [submitModalPeriod, setSubmitModalPeriod] = useState<PeriodItem | null>(null);
  const [reviewModalData, setReviewModalData] = useState<{
    submission: any;
    reportName: string;
    periodLabel: string;
  } | null>(null);

  // Extract unique filter options
  const uniqueMonths = useMemo(() => {
    const set = new Set<string>();
    periods.forEach((p) => set.add(p.periodLabel));
    return Array.from(set);
  }, [periods]);

  const uniqueDepartments = useMemo(() => {
    const set = new Set<string>();
    periods.forEach((p) => {
      const dept = p.assignment.user.department || p.assignment.report.defaultDepartment;
      if (dept) set.add(dept);
    });
    return Array.from(set).sort();
  }, [periods]);

  const uniquePics = useMemo(() => {
    const set = new Set<string>();
    periods.forEach((p) => {
      if (p.assignment.pic?.name) set.add(p.assignment.pic.name);
    });
    return Array.from(set).sort();
  }, [periods]);

  // Filtered List
  const filteredPeriods = useMemo(() => {
    return periods.filter((p) => {
      // Month
      if (selectedMonth !== "ALL") {
        if (p.periodLabel !== selectedMonth && !p.periodLabel.startsWith(selectedMonth)) {
          return false;
        }
      }

      // Status
      if (selectedStatus !== "ALL" && p.status !== selectedStatus) {
        return false;
      }

      // Department
      if (selectedDept !== "ALL") {
        const dept = p.assignment.user.department || p.assignment.report.defaultDepartment;
        if (dept !== selectedDept) return false;
      }

      // PIC
      if (selectedPic !== "ALL" && p.assignment.pic?.name !== selectedPic) {
        return false;
      }

      // Search
      if (search.trim()) {
        const s = search.toLowerCase();
        const reportName = p.assignment.report.name.toLowerCase();
        const userName = p.assignment.user.name.toLowerCase();
        const picName = (p.assignment.pic?.name || "").toLowerCase();
        const reviewerName = (p.assignment.reviewer?.name || "").toLowerCase();
        const code = (p.assignment.report.code || "").toLowerCase();

        return (
          reportName.includes(s) ||
          userName.includes(s) ||
          picName.includes(s) ||
          reviewerName.includes(s) ||
          code.includes(s)
        );
      }

      return true;
    });
  }, [periods, selectedMonth, selectedStatus, selectedDept, selectedPic, search]);

  // Pagination
  const totalPages = Math.ceil(filteredPeriods.length / itemsPerPage) || 1;
  const paginatedPeriods = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPeriods.slice(start, start + itemsPerPage);
  }, [filteredPeriods, currentPage, itemsPerPage]);

  const handleOpenReview = (p: PeriodItem) => {
    const latestSub = p.submissions?.[0];
    if (latestSub) {
      setReviewModalData({
        submission: {
          ...latestSub,
          reportPeriodId: p.id,
        },
        reportName: p.assignment.report.name,
        periodLabel: p.periodLabel,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama laporan, PIC, user, reviewer, atau kode..."
              className="pl-9 text-xs h-9 bg-slate-50/50 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Bulan:</span>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">Semua Periode (2026)</option>
              {uniqueMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Departemen:</span>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">Semua Departemen</option>
              {uniqueDepartments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* PIC Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">PIC:</span>
            <select
              value={selectedPic}
              onChange={(e) => {
                setSelectedPic(e.target.value);
                setCurrentPage(1);
              }}
              className="h-9 px-3 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">Semua PIC</option>
              {uniquePics.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">Status:</span>
          {[
            { label: "Semua", value: "ALL" },
            { label: "Belum Dikerjakan", value: "PENDING" },
            { label: "In Progress", value: "IN_PROGRESS" },
            { label: "Submitted", value: "SUBMITTED" },
            { label: "Under Review", value: "UNDER_REVIEW" },
            { label: "Revisi", value: "REVISION" },
            { label: "Disetujui", value: "APPROVED" },
            { label: "Terlambat", value: "OVERDUE" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setSelectedStatus(tab.value);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                selectedStatus === tab.value
                  ? "bg-[#0055A5] text-white font-semibold shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400">
            Menampilkan <strong className="text-slate-700 dark:text-slate-300">{filteredPeriods.length}</strong> data
          </span>
        </div>
      </div>

      {/* Operational Data Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 dark:bg-[#1E293B] text-white font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4 min-w-[220px]">Deskripsi Laporan</th>
                <th className="py-3 px-3 min-w-[100px]">User / Dept</th>
                <th className="py-3 px-3 min-w-[90px]">PIC</th>
                <th className="py-3 px-3 min-w-[90px]">Reviewer</th>
                <th className="py-3 px-3 min-w-[110px]">Periode</th>
                <th className="py-3 px-2 text-center w-20">Final (Draft)</th>
                <th className="py-3 px-2 text-center w-20">Plan Submit</th>
                <th className="py-3 px-2 text-center w-20">Aktual</th>
                <th className="py-3 px-2 text-center w-20">Meeting</th>
                <th className="py-3 px-3 min-w-[130px]">Status</th>
                <th className="py-3 px-3 min-w-[120px]">Tenggat Waktu</th>
                <th className="py-3 px-3 text-right min-w-[130px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {paginatedPeriods.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="font-medium">Tidak ada data jadwal yang sesuai dengan filter.</p>
                  </td>
                </tr>
              ) : (
                paginatedPeriods.map((p, idx) => {
                  const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                  const isSubmittedOrReview =
                    p.status === "SUBMITTED" || p.status === "UNDER_REVIEW";
                  const canSubmit = currentUserRole === "ADMIN" || p.assignment.user.id === currentUserId;
                  const canReview =
                    isSubmittedOrReview &&
                    (currentUserRole === "ADMIN" ||
                      (currentUserRole === "PIC" && p.assignment.pic?.id === currentUserId) ||
                      (currentUserRole === "REVIEWER" && p.assignment.reviewer?.id === currentUserId));

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100/80 dark:border-slate-800/80"
                    >
                      <td className="py-3 px-3 text-center text-slate-500 dark:text-slate-400 font-mono">
                        {rowNumber}
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                        <Link
                          href={`/pekerjaan/${p.id}`}
                          className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline font-semibold block leading-snug"
                        >
                          {p.assignment.report.name}
                        </Link>
                        {p.assignment.report.code && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {p.assignment.report.code}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {p.assignment.user.department || p.assignment.report.defaultDepartment || "SPBD"}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block max-w-[100px]">
                          {p.assignment.user.name}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                        {p.assignment.pic?.name || "-"}
                      </td>

                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-medium">
                        {p.assignment.reviewer?.name || "-"}
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                          {p.periodLabel}
                        </span>
                      </td>

                      <td className="py-3 px-2 text-center font-mono font-medium text-slate-700 dark:text-slate-300">
                        Tgl {p.assignment.targetFinal || "-"}
                      </td>

                      <td className="py-3 px-2 text-center font-mono font-semibold text-blue-700 dark:text-blue-400">
                        Tgl {p.planDate || p.assignment.targetSubmit || "5"}
                      </td>

                      <td className="py-3 px-2 text-center font-mono">
                        {p.actualDate ? (
                          <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-[#008651] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            Tgl {p.actualDate}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 font-medium">-</span>
                        )}
                      </td>

                      <td className="py-3 px-2 text-center font-mono text-slate-500 dark:text-slate-400">
                        {p.assignment.meetingDate && p.assignment.meetingDate !== "N/A"
                          ? `Tgl ${p.assignment.meetingDate}`
                          : "-"}
                      </td>

                      <td className="py-3 px-3">
                        <StatusBadge status={p.status} size="sm" />
                      </td>

                      <td className="py-3 px-3">
                        <CountdownBadge deadline={p.deadlineSubmit} status={p.status} />
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Submit Trigger */}
                          {p.status !== "APPROVED" && canSubmit && (
                            <button
                              onClick={() => setSubmitModalPeriod(p)}
                              className="px-2 py-1 rounded text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-[#0055A5] dark:text-sky-400 hover:bg-[#0055A5] hover:text-white transition-colors border border-blue-200 dark:border-blue-800"
                              title="Submit Laporan"
                            >
                              <Send className="h-3 w-3 inline mr-1" />
                              Submit
                            </button>
                          )}

                          {/* Review Trigger for PIC/Reviewer */}
                          {canReview && (
                            <button
                              onClick={() => handleOpenReview(p)}
                              className="px-2 py-1 rounded text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 hover:bg-amber-600 hover:text-white transition-colors border border-amber-200 dark:border-amber-800"
                              title="Review Submission"
                            >
                              <CheckCircle2 className="h-3 w-3 inline mr-1" />
                              Review
                            </button>
                          )}

                          {/* Detail Link */}
                          <Link
                            href={`/pekerjaan/${p.id}`}
                            className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Buka Detail"
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

        {/* Pagination Footer */}
        <div className="flex items-center justify-between p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Halaman <strong className="text-slate-800 dark:text-slate-200">{currentPage}</strong> dari <strong className="text-slate-800 dark:text-slate-200">{totalPages}</strong> (Total {filteredPeriods.length} laporan)
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 px-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {submitModalPeriod && (
        <SubmitModal
          open={Boolean(submitModalPeriod)}
          onOpenChange={(open) => !open && setSubmitModalPeriod(null)}
          periodId={submitModalPeriod.id}
          reportName={submitModalPeriod.assignment.report.name}
          periodLabel={submitModalPeriod.periodLabel}
          versionNumber={(submitModalPeriod.submissions?.length || 0) + 1}
        />
      )}

      {/* Review Modal */}
      {reviewModalData && (
        <ReviewModal
          open={Boolean(reviewModalData)}
          onOpenChange={(open) => !open && setReviewModalData(null)}
          submission={reviewModalData.submission}
          reportName={reviewModalData.reportName}
          periodLabel={reviewModalData.periodLabel}
        />
      )}
    </div>
  );
}
