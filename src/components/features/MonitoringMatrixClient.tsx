"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { CountdownBadge } from "./CountdownBadge";
import { formatDateIndo, formatDateTimeIndo } from "@/lib/utils";
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Eye,
  Building2,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface PeriodItem {
  id: string;
  periodLabel: string;
  deadlineSubmit: Date | string;
  status: string;
  assignment: {
    targetSubmit?: string | null;
    targetFinal?: string | null;
    report: {
      id: string;
      name: string;
      code?: string | null;
      frequency: string;
    };
    user: {
      id: string;
      name: string;
      department?: string | null;
    };
    pic?: {
      name: string;
    } | null;
    reviewer?: {
      name: string;
    } | null;
  };
  submissions?: Array<{
    id: string;
    version: number;
    fileName: string;
    status: string;
    submittedAt: Date | string;
  }>;
}

interface MonitoringMatrixClientProps {
  periods: PeriodItem[];
}

export function MonitoringMatrixClient({ periods }: MonitoringMatrixClientProps) {
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("Oktober 2026");
  const [selectedIndicator, setSelectedIndicator] = useState("ALL");
  const [selectedDept, setSelectedDept] = useState("ALL");

  const getIndicator = (p: PeriodItem) => {
    if (p.status === "APPROVED") {
      return { type: "ON_TIME", label: "🟢 On Time (Approved)", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    }
    if (p.status === "OVERDUE") {
      return { type: "OVERDUE", label: "🔴 Overdue (Terlambat)", color: "text-red-700 bg-red-50 border-red-200 animate-pulse" };
    }
    if (p.status === "SUBMITTED" || p.status === "UNDER_REVIEW") {
      return { type: "UNDER_REVIEW", label: "🔵 Under Review (Menunggu PIC)", color: "text-blue-700 bg-blue-50 border-blue-200" };
    }
    if (p.status === "REVISION") {
      return { type: "REVISION", label: "🟠 Perlu Revisi", color: "text-rose-700 bg-rose-50 border-rose-200" };
    }
    return { type: "DUE_SOON", label: "🟡 Due Soon / In Progress", color: "text-amber-800 bg-amber-50 border-amber-200" };
  };

  const filtered = useMemo(() => {
    return periods.filter((p) => {
      if (selectedMonth !== "ALL" && p.periodLabel !== selectedMonth) return false;
      if (selectedDept !== "ALL") {
        const dept = p.assignment.user.department;
        if (dept !== selectedDept) return false;
      }

      const ind = getIndicator(p);
      if (selectedIndicator !== "ALL" && ind.type !== selectedIndicator) return false;

      if (search.trim()) {
        const s = search.toLowerCase();
        const rName = p.assignment.report.name.toLowerCase();
        const uName = p.assignment.user.name.toLowerCase();
        const pName = (p.assignment.pic?.name || "").toLowerCase();
        return rName.includes(s) || uName.includes(s) || pName.includes(s);
      }
      return true;
    });
  }, [periods, selectedMonth, selectedDept, selectedIndicator, search]);

  const uniqueMonths = useMemo(() => {
    const set = new Set<string>();
    periods.forEach((p) => set.add(p.periodLabel));
    return Array.from(set);
  }, [periods]);

  const uniqueDepts = useMemo(() => {
    const set = new Set<string>();
    periods.forEach((p) => {
      if (p.assignment.user.department) set.add(p.assignment.user.department);
    });
    return Array.from(set).sort();
  }, [periods]);

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari laporan, user, atau PIC..."
              className="pl-9 text-xs h-9 bg-slate-50/50"
            />
          </div>

          <div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-md border border-slate-200 bg-white font-medium text-slate-800 focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">Semua Periode</option>
              {uniqueMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-md border border-slate-200 bg-white font-medium text-slate-800 focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">Semua Departemen</option>
              {uniqueDepts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Compliance Indicators Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-500">Indikator Kepatuhan:</span>
          {[
            { label: "Semua", value: "ALL" },
            { label: "🟢 On Time", value: "ON_TIME" },
            { label: "🟡 Due Soon / In Progress", value: "DUE_SOON" },
            { label: "🔵 Under Review", value: "UNDER_REVIEW" },
            { label: "🔴 Overdue", value: "OVERDUE" },
          ].map((btn) => (
            <button
              key={btn.value}
              type="button"
              onClick={() => setSelectedIndicator(btn.value)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                selectedIndicator === btn.value
                  ? "bg-[#008651] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {btn.label}
            </button>
          ))}

          <span className="ml-auto text-xs text-slate-400">
            Total <strong>{filtered.length}</strong> entri monitoring
          </span>
        </div>
      </div>

      {/* Monitoring Grid Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4 min-w-[200px]">Pekerjaan / Laporan</th>
                <th className="py-3 px-3 min-w-[120px]">User Assignee</th>
                <th className="py-3 px-3 min-w-[100px]">PIC &amp; Reviewer</th>
                <th className="py-3 px-3 min-w-[100px]">Periode</th>
                <th className="py-3 px-3 min-w-[140px]">Indikator Operasional</th>
                <th className="py-3 px-3 min-w-[120px]">Submission Terakhir</th>
                <th className="py-3 px-3 text-right min-w-[90px]">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Layers className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium">Tidak ada data monitoring yang sesuai filter.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((p, idx) => {
                  const ind = getIndicator(p);
                  const latestSub = p.submissions?.[0];

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400 font-mono">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4">
                        <Link
                          href={`/pekerjaan/${p.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 block leading-snug"
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
                        <span className="font-semibold text-slate-900 block">
                          {p.assignment.user.department || "SPBD"}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate block">
                          {p.assignment.user.name}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-600">
                        <div>PIC: <strong className="text-slate-800">{p.assignment.pic?.name || "-"}</strong></div>
                        <div className="text-[10px] text-slate-400">Rev: {p.assignment.reviewer?.name || "-"}</div>
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-800">
                        {p.periodLabel}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${ind.color}`}
                        >
                          {ind.label}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {latestSub ? (
                          <div className="space-y-0.5">
                            <span className="font-mono text-[11px] text-slate-800 font-medium block truncate max-w-[130px]">
                              {latestSub.fileName}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {formatDateTimeIndo(latestSub.submittedAt)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum submit</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/pekerjaan/${p.id}`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Buka</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
