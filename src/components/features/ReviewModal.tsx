"use client";

import React, { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RotateCcw, FileText, User, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { formatDateTimeIndo } from "@/lib/utils";
import { reviewWorkAction } from "@/actions/worktrack-actions";
import { useToast } from "@/components/ui/toast";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: {
    id: string;
    reportPeriodId: string;
    version: number;
    fileName: string;
    fileUrl?: string | null;
    notes?: string | null;
    submittedAt: Date | string;
    submittedBy: {
      name: string;
      department?: string | null;
    };
  } | null;
  reportName: string;
  periodLabel: string;
}

export function ReviewModal({
  open,
  onOpenChange,
  submission,
  reportName,
  periodLabel,
}: ReviewModalProps) {
  const toast = useToast();
  const [mode, setMode] = useState<"APPROVE" | "REVISION">("APPROVE");
  const [reviewNotes, setReviewNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!submission) return null;

  const handleDecision = async (decision: "APPROVED" | "REVISION") => {
    if (decision === "REVISION" && !reviewNotes.trim()) {
      setError("Catatan perbaikan / revisi wajib dicantumkan untuk assignee.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await reviewWorkAction({
        submissionId: submission.id,
        periodId: submission.reportPeriodId,
        decision,
        reviewNotes: reviewNotes.trim() || undefined,
      });

      if (decision === "APPROVED") {
        toast.success(`Laporan "${reportName}" telah disetujui (Approved).`, "Verifikasi Selesai");
      } else {
        toast.warning(`Permintaan revisi untuk "${reportName}" telah dikirimkan ke penyusun.`, "Revisi Diminta");
      }

      onOpenChange(false);
      setReviewNotes("");
    } catch (err: any) {
      setError(err.message || "Gagal memproses review.");
      toast.error(err.message || "Gagal memproses review.", "Gagal Verifikasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Review Submission Laporan</DialogTitle>
        <DialogDescription>
          {reportName} • {periodLabel} (Versi {submission.version})
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2 text-xs">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submission Details Card */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>Disubmit oleh: <strong className="text-slate-900 dark:text-slate-100">{submission.submittedBy.name}</strong> ({submission.submittedBy.department || "-"})</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{formatDateTimeIndo(submission.submittedAt)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-start gap-2">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-mono font-medium text-slate-800 dark:text-slate-200">{submission.fileName}</p>
              {submission.fileUrl && (
                <a
                  href={`/api/submissions/${submission.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-block mt-0.5"
                >
                  Buka tautan file di Cloud ↗
                </a>
              )}
            </div>
          </div>

          {submission.notes && (
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
              &quot;{submission.notes}&quot;
            </div>
          )}
        </div>

        {/* Action Toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("APPROVE")}
            className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              mode === "APPROVE"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/20"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Setujui (Approve)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("REVISION")}
            className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              mode === "REVISION"
                ? "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700 ring-2 ring-rose-500/20"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <RotateCcw className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            <span>Minta Revisi</span>
          </button>
        </div>

        {/* Review Notes Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {mode === "REVISION" ? "Catatan Permintaan Revisi *" : "Catatan / Umpan Balik (Opsional)"}
          </label>
          <textarea
            rows={3}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder={
              mode === "REVISION"
                ? "Jelaskan bagian laporan mana yang perlu diperbaiki oleh assignee..."
                : "Laporan telah sesuai dengan format dan data terverifikasi..."
            }
            className="flex w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-100 px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={loading}>
            Batal
          </Button>
          {mode === "APPROVE" ? (
            <Button
              type="button"
              variant="success"
              size="sm"
              disabled={loading}
              onClick={() => handleDecision("APPROVED")}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Menyetujui...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  <span>Setujui Laporan</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={loading}
              onClick={() => handleDecision("REVISION")}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="mr-1.5 h-4 w-4" />
                  <span>Kirim Permintaan Revisi</span>
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </div>
    </Dialog>
  );
}
