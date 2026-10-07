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
  return <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs lg:flex-row lg:items-center">
    <label className="relative min-w-0 flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input defaultValue={params.get("search") || ""} onChange={(e) => apply({ search: e.target.value })} placeholder="Search employee, email, report, or file…" className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-[#008651]" /></label>
    <div className="flex gap-2"><select defaultValue={params.get("status") || ""} onChange={(e) => apply({ status: e.target.value })} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs"><option value="">All status</option><option value="SUBMITTED">Submitted</option><option value="UNDER_REVIEW">Review</option><option value="REVISION">Revision</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select><select defaultValue={params.get("month") || ""} onChange={(e) => apply({ month: e.target.value })} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs"><option value="">All months</option>{Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{new Date(2026, i).toLocaleString("en", { month: "short" })}</option>)}</select><a href={`/api/submissions/export?${params.toString()}`} className="inline-flex h-9 items-center gap-1 rounded-lg bg-[#0055A5] px-3 text-xs font-semibold text-white"><SlidersHorizontal className="h-3.5 w-3.5" />Export CSV</a></div>
  </div>;
}
