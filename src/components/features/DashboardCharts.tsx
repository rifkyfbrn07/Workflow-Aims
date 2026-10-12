"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Layers, TrendingUp, AlertCircle } from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";

interface DashboardChartsProps {
  statusDistribution: Array<{ name: string; count: number; color: string }>;
  monthlyTrend: Array<{ month: string; total: number; approved: number; revision: number }>;
}

export function DashboardCharts({ statusDistribution, monthlyTrend }: DashboardChartsProps) {
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const totalCount = statusDistribution.reduce((acc, curr) => acc + curr.count, 0);

  const approvedCount =
    statusDistribution.find((s) => s.name === "Approved")?.count || 0;
  const inProgressCount =
    (statusDistribution.find((s) => s.name === "In Progress")?.count || 0) +
    (statusDistribution.find((s) => s.name === "Submitted")?.count || 0) +
    (statusDistribution.find((s) => s.name === "Review")?.count || 0);
  const pendingCount =
    statusDistribution.find((s) => s.name === "Pending")?.count || 0;
  const overdueCount =
    statusDistribution.find((s) => s.name === "Overdue")?.count || 0;

  const programStatusData = [
    { name: "Realisasi Selesai", count: approvedCount, color: isDark ? "#10B981" : "#008651", label: "Approved" },
    { name: "Sedang Berjalan", count: inProgressCount, color: isDark ? "#0284C7" : "#0055A5", label: "In Progress / Review" },
    { name: "Rencana Terjadwal", count: pendingCount, color: isDark ? "#64748B" : "#94A3B8", label: "Plan" },
    { name: "Melewati Deadline", count: overdueCount, color: isDark ? "#EF4444" : "#DC2626", label: "Overdue" },
  ].filter((item) => item.count >= 0);

  const targetVsRealisasiData = monthlyTrend.map((m) => {
    return {
      month: m.month,
      Target: m.total,
      Realisasi: m.approved,
      Progres: Math.max(0, m.total - m.approved),
    };
  });

  const totalTargetSubmissions = monthlyTrend.reduce((acc, curr) => acc + curr.total, 0);
  const totalApprovedSubmissions = monthlyTrend.reduce((acc, curr) => acc + curr.approved, 0);

  const realisationRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 1. Status Program Donut Chart */}
      <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#008651] dark:text-emerald-400" />
              <span>Status Distribusi Program Kerja</span>
            </h2>
            <span className="text-[10px] font-bold text-[#008651] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 font-mono">
              2026
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tingkat penyelesaian program operasional: <strong className="text-slate-800 dark:text-slate-200">{realisationRate}%</strong>
          </p>
        </div>

        {/* Donut with center text or Empty State */}
        {totalCount === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
            <AlertCircle className="h-6 w-6 mb-1 text-slate-300 dark:text-slate-600" />
            <p>Belum ada data periode laporan aktif.</p>
          </div>
        ) : (
          <div className="relative h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={programStatusData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={84}
                  paddingAngle={3}
                  animationDuration={700}
                  onMouseEnter={(_, index) => setActivePieIndex(index)}
                  onMouseLeave={() => setActivePieIndex(null)}
                >
                  {programStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={activePieIndex === index ? (isDark ? "#F8FAFC" : "#0F172A") : (isDark ? "#0F172A" : "#FFFFFF")}
                      strokeWidth={activePieIndex === index ? 2 : 1}
                      className="cursor-pointer transition-all"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value} Periode (${totalCount > 0 ? Math.round(((value as number) / totalCount) * 100) : 0}%)`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: isDark ? "#090D16" : "#0F172A",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                    border: isDark ? "1px solid #1E293B" : "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                    padding: "6px 10px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center text in donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                {realisationRate}%
              </span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                Realisasi
              </span>
            </div>
          </div>
        )}

        {/* 4-Item Legend Grid */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          {programStatusData.map((item) => {
            const pct = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
            return (
              <div
                key={item.name}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-750 transition-colors hover:bg-slate-100/70 dark:hover:bg-slate-800"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate leading-tight">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate leading-tight">
                      {item.label}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block leading-tight">
                    {item.count}
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block leading-tight font-mono">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Target vs Realisasi Monthly Timeline Chart */}
      <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs flex flex-col justify-between transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#0055A5] dark:text-sky-400" />
              <span>Target vs Realisasi Bulanan</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Perbandingan beban jadwal laporan vs realisasi yang disetujui (Jan – Des 2026)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
              <span className="h-2.5 w-2.5 rounded bg-slate-300 dark:bg-slate-600 inline-block" />
              Target Jadwal
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold">
              <span className="h-2.5 w-2.5 rounded bg-[#008651] dark:bg-emerald-500 inline-block" />
              Realisasi (Approved)
            </span>
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="h-60 w-full my-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={targetVsRealisasiData}
              margin={{ top: 15, right: 10, left: -25, bottom: 0 }}
              barGap={3}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1E293B" : "#F1F5F9"} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: isDark ? "#94A3B8" : "#64748B", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: isDark ? "#94A3B8" : "#64748B" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#090D16" : "#0F172A",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                  border: isDark ? "1px solid #1E293B" : "none",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                  padding: "8px 12px",
                }}
                cursor={{ fill: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 134, 81, 0.05)" }}
              />
              <Bar
                dataKey="Target"
                name="Target Jadwal"
                fill={isDark ? "#334155" : "#CBD5E1"}
                radius={[3, 3, 0, 0]}
                maxBarSize={16}
                animationDuration={600}
              />
              <Bar
                dataKey="Realisasi"
                name="Realisasi Disetujui"
                fill={isDark ? "#10B981" : "#008651"}
                radius={[3, 3, 0, 0]}
                maxBarSize={16}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Total Target: {totalTargetSubmissions} Berkas • Realisasi: {totalApprovedSubmissions} Disetujui</span>
          <span className="font-semibold text-[#008651] dark:text-emerald-400">
            Kepatuhan Operasional: {totalTargetSubmissions > 0 ? Math.round((totalApprovedSubmissions / totalTargetSubmissions) * 100) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
}
