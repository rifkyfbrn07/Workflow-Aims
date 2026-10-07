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
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>Disubmit oleh: <strong>{submission.submittedBy.name}</strong> ({submission.submittedBy.department || "-"})</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{formatDateTimeIndo(submission.submittedAt)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-start gap-2">
            <FileText className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-mono font-medium text-slate-800">{submission.fileName}</p>
              {submission.fileUrl && (
                <a
                  href={`/api/submissions/${submission.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline inline-block mt-0.5"
                >
                  Buka tautan file di Cloud ↗
                </a>
              )}
            </div>
          </div>

          {submission.notes && (
            <div className="pt-2 border-t border-slate-200/60 text-slate-600 italic bg-white p-2 rounded border border-slate-200">
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
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Setujui (Approve)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("REVISION")}
            className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              mode === "REVISION"
                ? "bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-500/20"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <RotateCcw className="h-4 w-4 text-rose-600" />
            <span>Minta Revisi</span>
          </button>
        </div>

        {/* Review Notes Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
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
            className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
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
