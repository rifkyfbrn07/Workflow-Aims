import React from "react";
import { FolderSearch, AlertCircle, RefreshCw, XCircle } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  onClearFilter?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "Tidak ada data ditemukan",
  description = "Coba ubah kata kunci pencarian atau sesuaikan filter Anda.",
  onClearFilter,
  icon,
}: EmptyStateProps) {
  return (
    <div className="py-14 px-4 text-center rounded-xl border border-dashed border-slate-200 bg-white/60 flex flex-col items-center justify-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
        {icon || <FolderSearch className="h-6 w-6" />}
      </div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">{description}</p>
      {onClearFilter && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClearFilter}
          className="mt-4 text-xs font-semibold gap-1.5"
        >
          <XCircle className="h-3.5 w-3.5 text-slate-500" />
          <span>Reset Filter</span>
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Terjadi Kendala Memuat Data",
  description = "Sistem tidak dapat memuat data laporan saat ini. Silakan coba kembali beberapa saat lagi.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="py-14 px-4 text-center rounded-xl border border-red-200 bg-red-50/30 flex flex-col items-center justify-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-600 mt-1 max-w-sm">{description}</p>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4 text-xs font-semibold gap-1.5 border-slate-300"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-600" />
          <span>Coba Lagi</span>
        </Button>
      )}
    </div>
  );
}
