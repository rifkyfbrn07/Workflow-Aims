import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200/70", className)}
      {...props}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Top Banner Skeleton */}
      <div className="h-24 w-full rounded-xl bg-slate-200/70 animate-pulse" />

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl border border-slate-200 bg-white p-4 space-y-2"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 h-80 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-56 w-full rounded-lg" />
        </div>
        <div className="lg:col-span-7 h-80 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-56 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden p-4 space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-48 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-64" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <div className="lg:col-span-8 space-y-4">
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
