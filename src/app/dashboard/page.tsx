import React from "react";
import Link from "next/link";
import { getDashboardStats } from "@/services/dashboard-service";
import { getCurrentUser } from "@/lib/auth";
import { DashboardCharts } from "@/components/features/DashboardCharts";
import { ProgramWorkMatrix } from "@/components/features/ProgramWorkMatrix";
import { StatusBadge } from "@/components/features/StatusBadge";
import { CountdownBadge } from "@/components/features/CountdownBadge";
import { DashboardStaggerContainer } from "@/components/features/DashboardStaggerContainer";
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
  Users,
  FileText,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { triggerDeadlineCheckFormAction } from "@/actions/worktrack-actions";
import { UserRole } from "@prisma/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();
  const stats = await getDashboardStats({
    userId: currentUser?.id,
    role: currentUser?.role,
    department: currentUser?.department,
  });

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 11
      ? "Selamat pagi"
      : hour < 15
      ? "Selamat siang"
      : hour < 18
      ? "Selamat sore"
      : "Selamat malam";

  const todayFormatted = format(now, "dd MMMM yyyy", { locale: id });
  const timeFormatted = format(now, "HH:mm") + " WIB";

  const isUserRole = currentUser?.role === UserRole.USER;
  const isPicOrReviewer = currentUser?.role === UserRole.PIC || currentUser?.role === UserRole.REVIEWER;
  const isManagement = currentUser?.role === UserRole.MANAGEMENT;
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const userSpecific = stats.userSpecificData;

  const totalPeriods = stats.summary.total || 1;
  const realisationPct = Math.round((stats.summary.approved / totalPeriods) * 100);

  return (
    <div className="space-y-6">
      {/* 1. Top Corporate Operational Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-[#008651] dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-[#008651] dark:bg-emerald-400 animate-pulse" />
              Sistem Operasional Aktif
            </span>
            <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {todayFormatted} | {timeFormatted}
            </span>
            {currentUser?.department && (
              <>
                <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                <span className="text-xs font-semibold text-[#0055A5] dark:text-sky-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                  Divisi {currentUser.department}
                </span>
              </>
            )}
          </div>

          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            {greeting}, {currentUser?.name || "Rekan Kerja"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Ringkasan jadwal pelaporan berkala, cut-off kepatuhan dokumen operasional, dan status penugasan terkini PT Nusantara Regas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <form action={triggerDeadlineCheckFormAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all hover:scale-[1.01] active:scale-[0.98]"
              title="Perbarui status deadline & sinkronisasi database"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#008651] dark:text-emerald-400" />
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

      {/* 2. ROLE-SPECIFIC OPERATIONAL SPOTLIGHT BANNER */}
      {isUserRole && userSpecific && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0055A5] text-white">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Fokus Tugas &amp; Prioritas Anda
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Daftar laporan yang ditugaskan kepada Anda pada periode berjalan.
                </p>
              </div>
            </div>
            <Link
              href="/pekerjaan"
              className="text-xs font-semibold text-[#0055A5] dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua Tugas</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Tugas Ditugaskan</span>
              <span className="text-lg font-black text-slate-900 dark:text-slate-100">{userSpecific.myTotalAssigned} Laporan</span>
            </div>
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 block">Perlu Dikerjakan</span>
              <span className="text-lg font-black text-sky-700 dark:text-sky-300">{userSpecific.myPending.length} Periode</span>
            </div>
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">Perlu Revisi PIC</span>
              <span className="text-lg font-black text-rose-700 dark:text-rose-300">{userSpecific.myRevisions.length} Berkas</span>
            </div>
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-[#008651] dark:text-emerald-400 block">Telah Disetujui</span>
              <span className="text-lg font-black text-[#008651] dark:text-emerald-400">{userSpecific.myApprovedCount} Berkas</span>
            </div>
          </div>
        </div>
      )}

      {isPicOrReviewer && userSpecific && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D97706] text-white">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Antrean Peninjauan &amp; Review (PIC / Reviewer)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Submission dari penyusun laporan yang membutuhkan verifikasi atau tindakan persetujuan Anda.
                </p>
              </div>
            </div>
            <Link
              href="/submissions"
              className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1"
            >
              <span>Buka Submission Hub</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">Menunggu Review Anda</span>
              <span className="text-lg font-black text-amber-700 dark:text-amber-300">{userSpecific.waitingReview.length} Submission</span>
            </div>
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">Dalam Proses Revisi</span>
              <span className="text-lg font-black text-rose-700 dark:text-rose-300">{userSpecific.picRevisions.length} Berkas</span>
            </div>
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 block">Overdue dalam Pengawasan</span>
              <span className="text-lg font-black text-red-700 dark:text-red-300">{userSpecific.picOverdue.length} Jadwal</span>
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 p-4 space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-700 text-white">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Status Master &amp; Tata Kelola Sistem (Admin)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Data master konfigurasi pelaporan berkala dan akun pengguna operasional.
                </p>
              </div>
            </div>
            <Link
              href="/master/reports"
              className="text-xs font-semibold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-1"
            >
              <span>Kelola Master</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Master Laporan</span>
              <span className="text-lg font-black text-slate-900 dark:text-slate-100">{stats.summary.totalReports} Program Aktif</span>
            </div>
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Total Pengguna</span>
              <span className="text-lg font-black text-slate-900 dark:text-slate-100">{stats.summary.totalUsers} Pengguna Aktif</span>
            </div>
            <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Matriks Penugasan</span>
              <span className="text-lg font-black text-slate-900 dark:text-slate-100">{stats.summary.totalAssignments} Hub Penugasan</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Compact Enterprise KPI Cards with GSAP Stagger Entrance */}
      <DashboardStaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* Total Program */}
        <div className="gsap-stagger-item rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Program</span>
            <Layers className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{stats.summary.total}</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Semua Periode 2026</div>
          </div>
        </div>

        {/* Pending */}
        <div className="gsap-stagger-item rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Rencana (Plan)</span>
            <div className="h-2 w-2 rounded-full bg-slate-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-700 dark:text-slate-300 tracking-tight">{stats.summary.pending}</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Belum dimulai</div>
          </div>
        </div>

        {/* In Progress */}
        <div className="gsap-stagger-item rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">Progres</span>
            <Clock className="h-4 w-4 text-sky-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-sky-700 dark:text-sky-300 tracking-tight">{stats.summary.inProgress}</div>
            <div className="text-[10px] text-sky-600 dark:text-sky-400 mt-0.5">Sedang dikerjakan</div>
          </div>
        </div>

        {/* Under Review */}
        <div className="gsap-stagger-item rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Review PIC</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-300 tracking-tight">{stats.summary.underReview + stats.summary.submitted}</div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">Menunggu tindak lanjut</div>
          </div>
        </div>

        {/* Revision */}
        <div className="gsap-stagger-item rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Perlu Revisi</span>
            <RotateCcw className="h-4 w-4 text-rose-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-rose-700 dark:text-rose-300 tracking-tight">{stats.summary.revision}</div>
            <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">Catatan perbaikan</div>
          </div>
        </div>

        {/* Approved */}
        <div className="gsap-stagger-item rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#008651] dark:text-emerald-400">Disetujui</span>
            <CheckCircle2 className="h-4 w-4 text-[#008651] dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#008651] dark:text-emerald-400 tracking-tight">{stats.summary.approved}</div>
            <div className="text-[10px] text-[#008651] dark:text-emerald-400 mt-0.5 font-medium">{realisationPct}% selesai</div>
          </div>
        </div>

        {/* Overdue */}
        <div className="gsap-stagger-item rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/20 p-4 shadow-2xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between text-red-600 dark:text-red-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400">Overdue</span>
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-black text-red-700 dark:text-red-400 tracking-tight">{stats.summary.overdue}</div>
            <div className="text-[10px] text-red-600 dark:text-red-400 mt-0.5 font-bold">Melewati Cut-Off</div>
          </div>
        </div>
      </DashboardStaggerContainer>

      {/* 4. Enterprise Visual Charts */}
      <DashboardCharts
        statusDistribution={stats.statusDistribution}
        monthlyTrend={stats.monthlyTrend}
      />

      {/* 5. 12-Month Master Matrix Overview */}
      <ProgramWorkMatrix
        matrixData={stats.matrixData}
        title="Matriks Jadwal Laporan Operasional 2026"
        subtitle="Visualisasi jadwal cut-off bulanan dan status persetujuan laporan seluruh unit kerja"
      />

      {/* 6. Operational Priority Grid: Overdue & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Critical Overdue Table */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Laporan Melewati Cut-Off (Overdue)
                </h2>
              </div>
              <span className="text-xs font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded-full font-mono">
                {stats.criticalOverdue.length} Tertunda
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2 max-h-80 overflow-y-auto">
              {stats.criticalOverdue.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-[#008651] dark:text-emerald-400" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Tidak ada laporan yang terlambat!</p>
                  <p className="text-[11px] text-slate-400">Seluruh jadwal operasional berjalan sesuai tata kelola cut-off.</p>
                </div>
              ) : (
                stats.criticalOverdue.map((p) => (
                  <div
                    key={p.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg px-2 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/pekerjaan/${p.id}`}
                        className="font-bold text-slate-800 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 truncate block leading-snug"
                      >
                        {p.assignment.report.name}
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-medium text-slate-600 dark:text-slate-300">{p.periodLabel}</span>
                        <span>•</span>
                        <span>PIC: {p.assignment.pic?.name || p.assignment.user.name}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <CountdownBadge deadline={p.deadlineSubmit} status={p.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
            <Link
              href="/jadwal?status=OVERDUE"
              className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Audit Seluruh Overdue</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Upcoming Deadlines Table */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#0055A5] dark:text-sky-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Deadline Terdekat Mendatang
                </h2>
              </div>
              <span className="text-xs font-bold text-[#0055A5] dark:text-sky-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-full font-mono">
                {stats.upcomingDeadlines.length} Jadwal
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2 max-h-80 overflow-y-auto">
              {stats.upcomingDeadlines.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                  <Calendar className="h-6 w-6 mx-auto mb-1 text-slate-300 dark:text-slate-600" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Tidak ada deadline yang mendekat saat ini.</p>
                </div>
              ) : (
                stats.upcomingDeadlines.map((p) => (
                  <div
                    key={p.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg px-2 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/pekerjaan/${p.id}`}
                        className="font-bold text-slate-800 dark:text-slate-200 hover:text-[#008651] dark:hover:text-emerald-400 truncate block leading-snug"
                      >
                        {p.assignment.report.name}
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-medium text-slate-600 dark:text-slate-300">{p.periodLabel}</span>
                        <span>•</span>
                        <span>Cut-Off: {formatDateIndo(p.deadlineSubmit)}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <CountdownBadge deadline={p.deadlineSubmit} status={p.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
            <Link
              href="/kalender"
              className="text-xs font-semibold text-[#0055A5] dark:text-sky-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Buka Kalender &amp; Timeline</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 7. Recent Submissions & Audit Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Submissions */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-[#008651] dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Submission Dokumen Terbaru
              </h2>
            </div>
            <Link href="/submissions" className="text-xs font-semibold text-[#008651] dark:text-emerald-400 hover:underline">
              Semua Submission →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2 max-h-72 overflow-y-auto">
            {stats.recentSubmissions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                <FileSpreadsheet className="h-6 w-6 mx-auto mb-1 text-slate-300 dark:text-slate-600" />
                <p>Belum ada submission berkas yang diunggah.</p>
              </div>
            ) : (
              stats.recentSubmissions.map((s) => (
                <div key={s.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {s.reportPeriod.assignment.report.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Oleh <strong className="text-slate-700 dark:text-slate-300">{s.submittedBy.name}</strong> • {formatDateTimeIndo(s.submittedAt)}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={s.status} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Audit Activities */}
        <div className="lg:col-span-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#0055A5] dark:text-sky-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Log Aktivitas Operasional
              </h2>
            </div>
            <Link href="/history" className="text-xs font-semibold text-[#0055A5] dark:text-sky-400 hover:underline">
              Audit Trail Lengkap →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2 max-h-72 overflow-y-auto">
            {stats.recentActivities.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                <Activity className="h-6 w-6 mx-auto mb-1 text-slate-300 dark:text-slate-600" />
                <p>Belum ada riwayat aktivitas yang tercatat.</p>
              </div>
            ) : (
              stats.recentActivities.map((act) => (
                <div key={act.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[11px] block truncate">
                      {act.action}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      User: {act.user?.name || "System"} • {formatDateTimeIndo(act.createdAt)}
                    </span>
                  </div>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-mono shrink-0">
                    {act.entityType}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
