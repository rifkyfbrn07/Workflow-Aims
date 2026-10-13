"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";

export function SubmissionFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const apply = (values: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(values).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    next.delete("page");
    router.replace(`${pathname}?${next.toString()}`);
  };
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-3 shadow-2xs lg:flex-row lg:items-center">
      <label className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          defaultValue={params.get("search") || ""}
          onChange={(e) => apply({ search: e.target.value })}
          placeholder="Cari pegawai, email, laporan, atau nama berkas..."
          className="h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#008651]"
        />
      </label>
      <div className="flex flex-wrap sm:flex-nowrap gap-2">
        <select
          defaultValue={params.get("status") || ""}
          onChange={(e) => apply({ status: e.target.value })}
          className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
        >
          <option value="">Semua Status</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Review</option>
          <option value="REVISION">Revision</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select
          defaultValue={params.get("month") || ""}
          onChange={(e) => apply({ month: e.target.value })}
          className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
        >
          <option value="">Semua Bulan</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i + 1}>
              {new Date(2026, i).toLocaleString("id-ID", { month: "short" })}
            </option>
          ))}
        </select>
        <a
          href={`/api/submissions/export?${params.toString()}`}
          className="inline-flex h-9 items-center gap-1 rounded-lg bg-[#0055A5] hover:bg-[#004382] px-3 text-xs font-semibold text-white shadow-2xs transition-colors"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Export CSV</span>
        </a>
      </div>
    </div>
  );
}
