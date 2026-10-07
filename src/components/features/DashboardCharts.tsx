"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
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
  Legend,
} from "recharts";
import { CheckCircle2, Clock, AlertTriangle, Layers, TrendingUp } from "lucide-react";

interface DashboardChartsProps {
  statusDistribution: Array<{ name: string; count: number; color: string }>;
  monthlyTrend: Array<{ month: string; total: number; approved: number; revision: number }>;
}

export function DashboardCharts({ statusDistribution, monthlyTrend }: DashboardChartsProps) {
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  // Group statusDistribution into 4 core operational buckets as specified in reference:
  // 1. Realisation (Approved / Selesai) -> Pertamina Green
  // 2. In Progress (In Progress / Submitted / Review) -> Pertamina Blue / Sky Blue
  // 3. Plan (Pending / Scheduled) -> Light Slate
  // 4. Overdue (Terlambat) -> Red
  const totalCount = statusDistribution.reduce((acc, curr) => acc + curr.count, 0) || 1;

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
    { name: "Realisation", count: approvedCount, color: "#008651", label: "Realisasi Selesai" },
    { name: "In Progress", count: inProgressCount, color: "#0055A5", label: "Sedang Dikerjakan" },
    { name: "Plan", count: pendingCount, color: "#94A3B8", label: "Rencana (Plan)" },
    { name: "Overdue", count: overdueCount, color: "#DC2626", label: "Melewati Deadline" },
  ].filter((item) => item.count >= 0);

  // Transform monthlyTrend into Target vs Realisasi
  const targetVsRealisasiData = monthlyTrend.map((m) => {
    // Target is typically the total assigned reports for that month (e.g. 20)
    const target = m.total > 0 ? m.total : 20;
    const realisasi = m.approved;
    const inProgress = m.total - m.approved > 0 ? m.total - m.approved : 0;
    return {
      month: m.month,
      Target: target,
      Realisasi: realisasi,
      Progres: inProgress,
    };
  });

  const realisationRate = Math.round((approvedCount / totalCount) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 1. Status Program Donut Chart */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#008651]" />
              <span>Status Program Kerja</span>
            </h2>
            <span className="text-[10px] font-bold text-[#008651] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
              2026
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tingkat penyelesaian program operasional: <strong>{realisationRate}%</strong>
          </p>
        </div>

        {/* Donut with center text */}
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
                animationDuration={800}
                onMouseEnter={(_, index) => setActivePieIndex(index)}
                onMouseLeave={() => setActivePieIndex(null)}
              >
                {programStatusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={activePieIndex === index ? "#0F172A" : "none"}
                    strokeWidth={activePieIndex === index ? 2 : 0}
                    className="cursor-pointer transition-all"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any) => [
                  `${value} Laporan (${Math.round(((value as number) / totalCount) * 100)}%)`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
                  padding: "6px 10px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center text in donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {realisationRate}%
            </span>
            <span className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
              Realisasi
            </span>
          </div>
        </div>

        {/* 4-Item Legend Grid */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
          {programStatusData.map((item) => {
            const pct = Math.round((item.count / totalCount) * 100);
            return (
              <div
                key={item.name}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100/70"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-[11px] truncate leading-tight">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate leading-tight">
                      {item.label}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-slate-900 text-xs block leading-tight">
                    {item.count}
                  </span>
                  <span className="text-[9px] text-slate-400 block leading-tight font-mono">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 2. Target vs Realisasi Monthly Timeline Chart */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.08 }}
        className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#0055A5]" />
              <span>Target vs Realisasi Bulanan</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Perbandingan beban target vs laporan yang telah disetujui (Jan – Des 2026)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="h-2.5 w-2.5 rounded bg-slate-300 inline-block" />
              Target (Plan)
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
              <span className="h-2.5 w-2.5 rounded bg-[#008651] inline-block" />
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#64748B", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
                  padding: "8px 12px",
                }}
                cursor={{ fill: "rgba(0, 134, 81, 0.05)" }}
              />
              <Bar
                dataKey="Target"
                name="Target (Plan)"
                fill="#CBD5E1"
                radius={[3, 3, 0, 0]}
                maxBarSize={16}
                animationDuration={600}
              />
              <Bar
                dataKey="Realisasi"
                name="Realisasi (Approved)"
                fill="#008651"
                radius={[3, 3, 0, 0]}
                maxBarSize={16}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span>* Sinkronisasi data real-time dari PostgreSQL AIMS.</span>
          <span className="font-semibold text-[#008651]">
            Status Operasional: Stabil
          </span>
        </div>
      </motion.div>
    </div>
  );
}
