import React from "react";
import Link from "next/link";
import { getDashboardStats } from "@/services/dashboard-service";
import { getCurrentUser } from "@/lib/auth";
import { DashboardCharts } from "@/components/features/DashboardCharts";
import { ProgramWorkMatrix } from "@/components/features/ProgramWorkMatrix";
import { StatusBadge } from "@/components/features/StatusBadge";
import { CountdownBadge } from "@/components/features/CountdownBadge";
import { formatDateIndo, formatDateTimeIndo } from "@/lib/utils";
import {
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  RotateCcw,
  ArrowUpRight,
  Calendar,
  User,
  ShieldCheck,
  RefreshCw,
  Bell,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Activity,
  FileSpreadsheet,
} from "lucide-react";
import { triggerDeadlineCheckFormAction } from "@/actions/worktrack-actions";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const currentUser = await getCurrentUser();

  // Determine dynamic greeting based on current hour
  const hour = new Date().getHours();
  const greeting =
    hour < 11
      ? "Selamat pagi"
      : hour < 15
      ? "Selamat siang"
      : hour < 18
      ? "Selamat sore"
      : "Selamat malam";

  const todayFormatted = "05 Oktober 2026";
  const lastUpdatedFormatted = "15:42 WIB";

  return (
    <div className="space-y-6">
      {/* 1. Top Corporate Operational Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-50 text-[#008651] px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-[#008651] animate-pulse" />
              Sistem Operasional Aktif
            </span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {todayFormatted} | Last updated {lastUpdatedFormatted}
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
            {greeting}, {currentUser?.name || "Rekan Kerja"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Berikut ringkasan jadwal pelaporan berkala, cut-off operasional, dan kepatuhan pengerjaan tugas Anda.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <form action={triggerDeadlineCheckFormAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-all hover:scale-[1.01] active:scale-[0.98]"
              title="Perbarui status deadline & kirim reminder otomatis"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#008651]" />
              <span>Sinkron Data</span>
            </button>
          </form>

          <Link
            href="/pekerjaan"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#008651] hover:bg-[#007244] text-white shadow-xs transition-all hover:scale-[1.01] active:scale-[0.98]"
          >
            <span>Pekerjaan Saya</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. Compact Operational KPI Cards with Hover Elevate */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Tasks */}
        <div className="group rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Program</span>
            <Layers className="h-4 w-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{stats.summary.total}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] text-[#008651] font-bold">+8.4%</span>
              <span className="text-[10px] text-slate-400">vs bulan lalu</span>
            </div>
          </div>
        </div>

        {/* Pending / Plan */}
        <div className="group rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rencana (Plan)</span>
            <div className="h-2 w-2 rounded-full bg-slate-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 tracking-tight">{stats.summary.pending}</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Belum dimulai</p>
          </div>
        </div>

        {/* In Progress */}
        <div className="group rounded-xl border border-sky-200/80 bg-sky-50/20 p-4 shadow-2xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-sky-300">
          <div className="flex items-center justify-between text-sky-700 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">In Progress</span>
            <Clock className="h-4 w-4 text-sky-600 group-hover:text-sky-800 transition-colors" />
          </div>
          <div>
            <div className="text-2xl font-black text-sky-900 tracking-tight">{stats.summary.inProgress}</div>
            <p className="text-[10px] text-sky-700 mt-0.5">Sedang dikerjakan</p>
          </div>
        </div>

        {/* Review / Submitted */}
        <div className="group rounded-xl border border-blue-200/80 bg-blue-50/20 p-4 shadow-2xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-300">
          <div className="flex items-center justify-between text-[#0055A5] mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0055A5]">Under Review</span>
            <Send className="h-4 w-4 text-[#0055A5] group-hover:scale-105 transition-transform" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#0055A5] tracking-tight">
              {stats.summary.submitted + stats.summary.underReview}
            </div>
            <p className="text-[10px] text-[#0055A5] mt-0.5">Menunggu PIC/Rev</p>
          </div>
        </div>

        {/* Approved */}
        <div className="group rounded-xl border border-emerald-200/80 bg-emerald-50/20 p-4 shadow-2xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-300">
          <div className="flex items-center justify-between text-[#008651] mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#008651]">Realisasi (OK)</span>
            <CheckCircle2 className="h-4 w-4 text-[#008651] group-hover:scale-105 transition-transform" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#008651] tracking-tight">{stats.summary.approved}</div>
            <p className="text-[10px] text-emerald-700 mt-0.5">Disetujui penuh</p>
          </div>
        </div>

        {/* Overdue */}
        <div className="group rounded-xl border border-red-200/80 bg-red-50/20 p-4 shadow-2xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-red-300">
          <div className="flex items-center justify-between text-red-700 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">Terlambat</span>
            <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-black text-red-900 tracking-tight">{stats.summary.overdue}</div>
            <p className="text-[10px] text-red-600 font-semibold mt-0.5">Melewati cut-off</p>
          </div>
        </div>
      </div>

      {/* 3. Visual Analytics Charts */}
      <DashboardCharts
        statusDistribution={stats.statusDistribution}
        monthlyTrend={stats.monthlyTrend}
      />

      {/* 4. Operational 12-Month Matrix Table (Program Kerja) */}
      <ProgramWorkMatrix
        matrixData={stats.matrixData}
        title="Matriks Program Kerja & Laporan 2026"
        subtitle="Struktur operasional pemantauan seluruh jenis laporan berkala (Januari – Desember 2026)"
      />

      {/* 5. Two Column Grid: Upcoming Deadlines & Overdue Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upcoming Deadlines */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#0055A5]" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Tenggat Waktu Terdekat (Upcoming)
                </h2>
              </div>
              <Link
                href="/pekerjaan"
                className="text-xs text-[#008651] hover:text-[#007244] font-semibold flex items-center gap-0.5"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {stats.upcomingDeadlines.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
                  <p className="font-medium text-xs">Semua laporan periode terdekat telah terselesaikan.</p>
                </div>
              ) : (
                stats.upcomingDeadlines.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors group"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/pekerjaan/${item.id}`}
                        className="font-bold text-slate-900 group-hover:text-[#008651] block text-xs truncate transition-colors"
                      >
                        {item.assignment.report.name}
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">
                          {item.assignment.user.department || "SPBD"}
                        </span>
                        <span>•</span>
                        <span className="text-slate-600 font-medium">{item.periodLabel}</span>
                        <span>•</span>
                        <span className="text-slate-400">PIC: {item.assignment.pic?.name || "-"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <CountdownBadge deadline={item.deadlineSubmit} status={item.status} />
                      <Link
                        href={`/pekerjaan/${item.id}`}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-[#008651] hover:bg-[#008651] hover:text-white transition-all shadow-2xs"
                      >
                        Buka
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Overdue Alert Table */}
        <div className="rounded-xl border border-red-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-red-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Pekerjaan Terlambat (Overdue)
                </h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                {stats.summary.overdue} Melewati Cut-Off
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {stats.criticalOverdue.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
                  <p className="font-medium text-xs">Tidak ada laporan yang melewati batas waktu.</p>
                </div>
              ) : (
                stats.criticalOverdue.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-red-50/40 px-2 rounded-lg transition-colors group"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/pekerjaan/${item.id}`}
                        className="font-bold text-slate-900 group-hover:text-red-700 block text-xs truncate transition-colors"
                      >
                        {item.assignment.report.name}
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-bold text-red-700">
                          Batas: {formatDateIndo(item.deadlineSubmit)}
                        </span>
                        <span>•</span>
                        <span className="text-slate-600">{item.periodLabel}</span>
                        <span>•</span>
                        <span className="text-slate-400">Assignee: {item.assignment.user.name}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status="OVERDUE" size="sm" />
                      <Link
                        href={`/pekerjaan/${item.id}`}
                        className="px-2.5 py-1 text-xs font-bold rounded bg-red-600 text-white hover:bg-red-700 transition-colors shadow-2xs"
                      >
                        Tindak Lanjuti
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Live Audit Trail Stream */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#008651]" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Aktivitas &amp; Log Operasional Terkini
            </h2>
          </div>
          <Link
            href="/history"
            className="text-xs text-[#008651] hover:text-[#007244] font-semibold flex items-center gap-0.5"
          >
            <span>Seluruh Log Audit</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {stats.recentActivities.slice(0, 4).map((act) => {
            const meta = (act.metadata as any) || {};
            return (
              <div
                key={act.id}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-start gap-2.5 text-xs"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs shrink-0 mt-0.5">
                  {(act.user?.name || "S").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate">
                      {act.user?.name || "Sistem"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatDateTimeIndo(act.createdAt)}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-snug mt-0.5">
                    <span className="font-semibold text-slate-800">
                      {act.action === "TASK_SUBMITTED" && "Submit berkas laporan"}
                      {act.action === "TASK_APPROVED" && "Menyetujui (Approved)"}
                      {act.action === "REVISION_REQUESTED" && "Meminta revisi"}
                      {act.action === "TASK_STARTED" && "Mulai pengerjaan"}
                    </span>
                    {meta.reportName && ` "${meta.reportName}"`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
