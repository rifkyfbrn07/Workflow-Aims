"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TableProperties,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Building2,
  ChevronRight,
  Eye,
  Send,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { MONTH_NAMES } from "@/lib/constants";
import { SubmitModal } from "./SubmitModal";

export interface ProgramMatrixItem {
  reportId: string;
  reportName: string;
  reportCode?: string | null;
  department: string;
  picName: string;
  targetSubmitDay: string;
  periods: Record<
    number,
    {
      periodId: string;
      periodLabel: string;
      status: string;
      deadlineSubmit: Date | string;
    }
  >;
}

interface ProgramWorkMatrixProps {
  matrixData: ProgramMatrixItem[];
  title?: string;
  subtitle?: string;
}

export function ProgramWorkMatrix({
  matrixData,
  title = "Matriks Jadwal & Program Kerja 2026",
  subtitle = "Distribusi status pengerjaan seluruh laporan berkala per bulan (Januari – Desember 2026)",
}: ProgramWorkMatrixProps) {
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [submitPeriod, setSubmitPeriod] = useState<any | null>(null);

  const departments = useMemo(() => {
    const set = new Set<string>();
    matrixData.forEach((item) => {
      if (item.department) set.add(item.department);
    });
    return Array.from(set).sort();
  }, [matrixData]);

  const filteredData = useMemo(() => {
    return matrixData.filter((item) => {
      if (selectedDept !== "ALL" && item.department !== selectedDept) {
        return false;
      }
      if (search.trim()) {
        const s = search.toLowerCase();
        return (
          item.reportName.toLowerCase().includes(s) ||
          item.department.toLowerCase().includes(s) ||
          item.picName.toLowerCase().includes(s) ||
          (item.reportCode || "").toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [matrixData, selectedDept, search]);

  const getStatusPill = (status?: string, periodId?: string, reportName?: string, periodLabel?: string) => {
    if (!status) {
      return (
        <span className="inline-block w-full py-1 text-[10px] text-slate-300 font-mono text-center">
          -
        </span>
      );
    }

    switch (status) {
      case "APPROVED":
        return (
          <Link
            href={`/pekerjaan/${periodId}`}
            className="inline-flex items-center justify-center w-full py-1 px-1 rounded text-[10px] font-bold bg-emerald-100 text-[#008651] hover:bg-[#008651] hover:text-white transition-all shadow-2xs group"
            title={`Disetujui - ${periodLabel}`}
          >
            <span>✓ OK</span>
          </Link>
        );
      case "SUBMITTED":
      case "UNDER_REVIEW":
        return (
          <Link
            href={`/pekerjaan/${periodId}`}
            className="inline-flex items-center justify-center w-full py-1 px-1 rounded text-[10px] font-bold bg-blue-100 text-[#0055A5] hover:bg-[#0055A5] hover:text-white transition-all shadow-2xs"
            title={`Under Review - ${periodLabel}`}
          >
            <span>Review</span>
          </Link>
        );
      case "REVISION":
        return (
          <Link
            href={`/pekerjaan/${periodId}`}
            className="inline-flex items-center justify-center w-full py-1 px-1 rounded text-[10px] font-bold bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white transition-all shadow-2xs"
            title={`Perlu Revisi - ${periodLabel}`}
          >
            <span>Revisi</span>
          </Link>
        );
      case "OVERDUE":
        return (
          <Link
            href={`/pekerjaan/${periodId}`}
            className="inline-flex items-center justify-center w-full py-1 px-1 rounded text-[10px] font-extrabold bg-red-100 text-red-700 hover:bg-red-600 hover:text-white transition-all animate-pulse"
            title={`Terlambat (Overdue) - ${periodLabel}`}
          >
            <span>! Late</span>
          </Link>
        );
      case "IN_PROGRESS":
        return (
          <Link
            href={`/pekerjaan/${periodId}`}
            className="inline-flex items-center justify-center w-full py-1 px-1 rounded text-[10px] font-bold bg-sky-100 text-sky-800 hover:bg-sky-600 hover:text-white transition-all"
            title={`Sedang Dikerjakan - ${periodLabel}`}
          >
            <span>Progres</span>
          </Link>
        );
      default:
        // PENDING / PLAN
        return (
          <Link
            href={`/pekerjaan/${periodId}`}
            className="inline-flex items-center justify-center w-full py-1 px-1 rounded text-[10px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
            title={`Rencana (Pending) - ${periodLabel}`}
          >
            <span>Plan</span>
          </Link>
        );
    }
  };

  const shortMonths = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TableProperties className="h-4 w-4 text-[#008651]" />
            <span>{title}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari program kerja, PIC..."
              className="pl-8 text-xs h-8 bg-slate-50/50"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-8 px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#008651]"
          >
            <option value="ALL">Semua Departemen</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Operational Matrix Grid Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {/* Sticky horizontal container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0F172A] text-white font-bold uppercase tracking-wider text-[11px] sticky top-0 z-10 shadow-sm">
                <th className="py-3 px-3 w-10 text-center sticky left-0 z-20 bg-[#0F172A] border-r border-slate-800">
                  No
                </th>
                <th className="py-3 px-4 min-w-[240px] sticky left-10 z-20 bg-[#0F172A] border-r border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                  Program Kerja / Laporan
                </th>
                <th className="py-3 px-3 min-w-[100px] border-r border-slate-800/80">
                  Dept &amp; PIC
                </th>
                <th className="py-3 px-2 text-center w-14 border-r border-slate-800/80 font-mono">
                  Cut-Off
                </th>
                {shortMonths.map((m, idx) => (
                  <th
                    key={m}
                    className={`py-3 px-2 text-center min-w-[62px] border-r border-slate-800/50 ${
                      idx === 9 ? "bg-[#008651] text-white font-extrabold" : ""
                    }`}
                  >
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium">Tidak ada program kerja yang sesuai kriteria pencarian.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <motion.tr
                    key={item.reportId}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: Math.min(idx * 0.02, 0.3) }}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Sticky No */}
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono sticky left-0 z-10 bg-white group-hover:bg-slate-50/80 border-r border-slate-100">
                      {idx + 1}
                    </td>

                    {/* Sticky Report Name */}
                    <td className="py-2.5 px-4 font-bold text-slate-900 sticky left-10 z-10 bg-white group-hover:bg-slate-50/80 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      <div className="flex flex-col">
                        <span className="leading-snug text-slate-800 group-hover:text-[#008651] transition-colors">
                          {item.reportName}
                        </span>
                        {item.reportCode && (
                          <span className="text-[10px] text-slate-400 font-mono font-normal">
                            {item.reportCode}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Department & PIC */}
                    <td className="py-2.5 px-3 border-r border-slate-100">
                      <span className="font-bold text-slate-900 block">{item.department}</span>
                      <span className="text-[10px] text-slate-400 truncate block max-w-[100px]">
                        {item.picName}
                      </span>
                    </td>

                    {/* Target Cut Off Day */}
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-[#0055A5] border-r border-slate-100">
                      Tgl {item.targetSubmitDay}
                    </td>

                    {/* 12 Months Grid */}
                    {Array.from({ length: 12 }).map((_, mIdx) => {
                      const period = item.periods[mIdx];
                      const isCurrentMonth = mIdx === 9; // Oktober 2026

                      return (
                        <td
                          key={mIdx}
                          className={`py-2 px-1 text-center border-r border-slate-100/80 ${
                            isCurrentMonth ? "bg-emerald-50/40" : ""
                          }`}
                        >
                          {getStatusPill(
                            period?.status,
                            period?.periodId,
                            item.reportName,
                            period?.periodLabel
                          )}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Operational Footer Legend */}
        <div className="p-3 bg-slate-50/80 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="font-bold text-slate-500">Keterangan:</span>
            <span className="inline-flex items-center gap-1 text-[#008651] font-semibold">
              <span className="h-2.5 w-2.5 rounded bg-emerald-100 border border-emerald-300" />
              ✓ OK (Disetujui)
            </span>
            <span className="inline-flex items-center gap-1 text-[#0055A5] font-semibold">
              <span className="h-2.5 w-2.5 rounded bg-blue-100 border border-blue-300" />
              Review (Menunggu PIC)
            </span>
            <span className="inline-flex items-center gap-1 text-sky-800 font-semibold">
              <span className="h-2.5 w-2.5 rounded bg-sky-100 border border-sky-300" />
              Progres (Dikerjakan)
            </span>
            <span className="inline-flex items-center gap-1 text-red-700 font-bold">
              <span className="h-2.5 w-2.5 rounded bg-red-100 border border-red-300" />
              ! Late (Terlambat)
            </span>
            <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
              <span className="h-2.5 w-2.5 rounded bg-slate-100 border border-slate-300" />
              Plan (Rencana)
            </span>
          </div>

          <span className="text-[11px] text-slate-400 font-mono font-medium">
            Total <strong>{filteredData.length}</strong> Program Kerja
          </span>
        </div>
      </div>
    </div>
  );
}
