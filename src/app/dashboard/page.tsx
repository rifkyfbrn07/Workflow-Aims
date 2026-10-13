import React from "react";
import Link from "next/link";
import { getDashboardStats } from "@/services/dashboard-service";
import { getCurrentUser } from "@/lib/auth";
import { DashboardCharts } from "@/components/features/DashboardCharts";
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
  Play,
  ArrowRight,
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
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const totalPeriods = stats.summary.total || 1;
  const realisationPct = Math.round((stats.summary.approved / totalPeriods) * 100);

  const actionItems = stats.actionRequiredList || [];
  const actionRequiredCount = actionItems.length;
  const upcomingCount = stats.upcomingDeadlines.length;
  const overdueCount = stats.criticalOverdue.length;
  const waitingReviewCount = stats.summary.underReview + stats.summary.submitted;
  const approvedCount = stats.summary.approved;

  return (
    <div className="space-y-6">
      {/* 1. TOP CORPORATE OPERATIONAL GREETING HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-[#0055A5] dark:text-sky-400 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 font-mono">
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
              <RefreshCw className="h-3.5 w-3.5 text-[#0055A5] dark:text-sky-400" />
              <span>Sinkron Data</span>
            </button>
          </form>

          <Link
            href="/pekerjaan"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#0055A5] hover:bg-[#00478B] text-white shadow-xs transition-all hover:scale-[1.01] active:scale-[0.98]"
          >
            <span>Pekerjaan Saya</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. OPERATIONAL SUMMARY — COMPACT 5 ACTIONABLE METRICS */}
      <DashboardStaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: Tindakan Diperlukan (Action Required) */}
        <div className="gsap-stagger-item rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 p-4 shadow-2xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between text-[#0055A5] dark:text-sky-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Perlu Tindakan</span>
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#0055A5] dark:text-sky-300 tracking-tight">
              {actionRequiredCount}
            </div>
            <div className="text-[10px] text-blue-700/80 dark:text-sky-400/80 mt-0.5 font-medium">
              Tugas menunggu respon Anda
            </div>
          </div>
        </div>

        {/* Metric 2: Upcoming Deadlines */}
        <div className="gsap-stagger-item rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Deadline Terdekat</span>
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {upcomingCount}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              Dalam rentang cut-off berjalan
            </div>
          </div>
        </div>

        {/* Metric 3: Overdue Reports */}
        <div className="gsap-stagger-item rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 p-4 shadow-2xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between text-red-600 dark:text-red-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400">Melewati Cut-Off</span>
            <AlertTriangle className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-black text-red-700 dark:text-red-400 tracking-tight">
              {overdueCount}
            </div>
            <div className="text-[10px] text-red-600 dark:text-red-400 mt-0.5 font-bold">
              Membutuhkan penyelesaian cepat
            </div>
          </div>
        </div>

        {/* Metric 4: Antrean Review */}
        <div className="gsap-stagger-item rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-4 shadow-2xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Antrean Review</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-800 dark:text-amber-300 tracking-tight">
              {waitingReviewCount}
            </div>
            <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5 font-medium">
              Menunggu verifikasi PIC/Reviewer
            </div>
          </div>
        </div>

        {/* Metric 5: Realisasi Disetujui (Approved) */}
        <div className="gsap-stagger-item rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 shadow-2xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between text-[#008651] dark:text-emerald-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#008651] dark:text-emerald-400">Realisasi Selesai</span>
            <CheckCircle2 className="h-4 w-4 text-[#008651] dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#008651] dark:text-emerald-400 tracking-tight">
              {approvedCount}
            </div>
            <div className="text-[10px] text-[#008651] dark:text-emerald-400 mt-0.5 font-bold">
              {realisationPct}% dari total {totalPeriods} periode
            </div>
          </div>
        </div>
      </DashboardStaggerContainer>

      {/* 3. HERO SECTION — ACTION-REQUIRED TASKS (Most Prominent Area) */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0055A5] text-white shadow-2xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Laporan &amp; Tugas Memerlukan Tindakan Segera
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daftar pekerjaan prioritas yang membutuhkan input, pengunggahan berkas, atau verifikasi dari Anda
              </p>
            </div>
          </div>

          <Link
            href="/pekerjaan"
            className="text-xs font-semibold text-[#0055A5] dark:text-sky-400 hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Semua Pekerjaan Saya</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {actionItems.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500 space-y-1.5">
            <CheckCircle2 className="h-8 w-8 mx-auto text-[#008651] dark:text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Semua Tugas Berjalan Lancar!</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Tidak ada laporan yang membutuhkan tindakan segera dari Anda saat ini. Seluruh jadwal dan submission berada dalam status terkendali.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {actionItems.map((item) => {
              const isRevision = item.status === "REVISION";
              const isOverdue = item.status === "OVERDUE";
              const isReview = item.status === "SUBMITTED" || item.status === "UNDER_REVIEW";

              return (
                <div
                  key={item.id}
                  className="py-3.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {/* Left: Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={item.href}
                        className="font-bold text-slate-900 dark:text-slate-100 hover:text-[#0055A5] dark:hover:text-sky-400 transition-colors block text-sm leading-snug"
                      >
                        {item.reportName}
                      </Link>
                      {item.reportCode && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          ({item.reportCode})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {item.periodLabel}
                      </span>
                      <span>•</span>
                      <span>{item.responsiblePerson}</span>
                      <span>•</span>
                      <span>Cut-Off: {formatDateIndo(item.deadlineSubmit)}</span>
                    </div>
                  </div>

                  {/* Right: Status Badge & Action Button */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <CountdownBadge deadline={item.deadlineSubmit} status={item.status} />
                    <StatusBadge status={item.status} size="sm" />

                    <Link
                      href={item.href}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        isRevision
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : isOverdue
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : isReview
                          ? "bg-amber-600 hover:bg-amber-700 text-white"
                          : "bg-[#0055A5] hover:bg-[#00478B] text-white"
                      }`}
                    >
                      {isRevision ? (
                        <RotateCcw className="h-3.5 w-3.5" />
                      ) : isReview ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      <span>{item.actionLabel}</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. OPERATIONAL PRIORITY GRID: UPCOMING DEADLINES & OVERDUE WATCHLIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Upcoming Deadlines */}
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
                        className="font-bold text-slate-800 dark:text-slate-200 hover:text-[#0055A5] dark:hover:text-sky-400 truncate block leading-snug"
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

        {/* Right: Critical Overdue Table */}
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
      </div>

      {/* 5. MASTER SCHEDULE 12-MONTH MATRIX BANNER */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shrink-0 border border-slate-200 dark:border-slate-700">
            <Calendar className="h-5 w-5 text-[#0055A5] dark:text-sky-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Matriks Jadwal &amp; Program Kerja 12 Bulan (Januari – Desember 2026)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pantau jadwal cut-off bulanan, tanggal meeting, target draft, dan realisasi seluruh program kerja unit operasional.
            </p>
          </div>
        </div>

        <Link
          href="/jadwal"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-[#0055A5] dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors shrink-0"
        >
          <span>Buka Matriks &amp; Jadwal Lengkap</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 6. ENTERPRISE PERFORMANCE CHARTS */}
      <DashboardCharts
        statusDistribution={stats.statusDistribution}
        monthlyTrend={stats.monthlyTrend}
      />

      {/* 7. RECENT SUBMISSIONS & AUDIT ACTIVITIES */}
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
