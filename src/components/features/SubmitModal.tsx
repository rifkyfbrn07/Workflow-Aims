"use client";

import React, { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UploadCloud,
  FileSpreadsheet,
  Link2,
  MessageSquare,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { submitWorkAction } from "@/actions/worktrack-actions";
import { useToast } from "@/components/ui/toast";

interface SubmitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodId: string;
  reportName: string;
  periodLabel: string;
  versionNumber?: number;
}

export function SubmitModal({
  open,
  onOpenChange,
  periodId,
  reportName,
  periodLabel,
  versionNumber = 1,
}: SubmitModalProps) {
  const toast = useToast();
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isResubmission = versionNumber > 1;

  // Auto-fill template filename
  React.useEffect(() => {
    if (open && !fileName) {
      const sanitized = reportName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
      const periodSanitized = periodLabel.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
      setFileName(`${sanitized}_${periodSanitized}${isResubmission ? `_v${versionNumber}` : ""}.xlsx`);
    }
  }, [open, reportName, periodLabel, isResubmission, versionNumber, fileName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) {
      setError("Nama berkas laporan wajib diisi.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (selectedFile) {
        const payload = new FormData();
        payload.append("periodId", periodId);
        payload.append("file", selectedFile);
        payload.append("notes", notes.trim());
        const response = await fetch("/api/submissions/upload", { method: "POST", body: payload });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Gagal mengunggah berkas.");
      } else {
        await submitWorkAction({
          periodId,
          fileName: fileName.trim(),
          fileUrl: fileUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      }

      setSuccess(true);
      toast.success(`Laporan "${reportName}" (${periodLabel}) berhasil dikirim ke PIC.`, "Pekerjaan Diserahkan");
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
        setNotes("");
      }, 900);
    } catch (err: any) {
      setError(err.message || "Gagal melakukan submission.");
      toast.error(err.message || "Gagal melakukan submission.", "Gagal Submit");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#008651] border border-emerald-200 shrink-0">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle>
              {isResubmission ? `Submit Revisi (Versi #${versionNumber})` : "Submit Laporan Pekerjaan"}
            </DialogTitle>
            <DialogDescription>
              {reportName} • {periodLabel}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Corporate Step Indicator */}
      <div className="py-2 px-3 rounded-lg bg-slate-50 border border-slate-200/80 my-2 text-[10px] flex items-center justify-between text-slate-500 font-medium">
        <span className="text-slate-400 font-semibold">1. Mulai</span>
        <span>→</span>
        <span className="text-slate-400 font-semibold">2. Siapkan File</span>
        <span>→</span>
        <span className="text-[#008651] font-bold">3. Submit</span>
        <span>→</span>
        <span className="text-slate-400">4. Review PIC</span>
        <span>→</span>
        <span className="text-slate-400">5. Approval</span>
      </div>

      {success ? (
        <div className="py-8 text-center space-y-2 animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-[#008651] mx-auto">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Submission Berhasil!</h3>
          <p className="text-xs text-slate-500">
            Berkas telah tercatat di sistem dan notifikasi telah dikirimkan ke PIC.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5 py-1 text-xs">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <UploadCloud className="h-3.5 w-3.5 text-slate-400" />
              <span>Upload File (Excel, CSV, atau PDF)</span>
            </label>
            <Input
              type="file"
              accept=".xlsx,.xls,.csv,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setSelectedFile(file);
                if (file) setFileName(file.name);
              }}
              className="text-xs h-10 border-slate-200 file:mr-3 file:border-0 file:bg-emerald-50 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-[#008651]"
            />
            <p className="text-[10px] text-slate-400">Maksimum 15 MB. File disimpan secara aman di Blob Storage.</p>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <FileSpreadsheet className="h-3.5 w-3.5 text-slate-400" />
              <span>Nama File / Dokumen Laporan *</span>
            </label>
            <Input
              type="text"
              required
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Contoh: Rekap_Operasional_Oktober_2026.xlsx"
              className="font-mono text-xs h-9 border-slate-200 focus:border-[#008651] focus:ring-[#008651]"
            />
            <p className="text-[10px] text-slate-400">Nama akan diambil dari file upload. Tautan cloud tetap didukung untuk workflow lama.</p>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5 text-slate-400" />
              <span>Tautan Cloud / OneDrive / SharePoint (Opsional)</span>
            </label>
            <Input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://pertamina.sharepoint.com/..."
              className="text-xs h-9 border-slate-200 focus:border-[#008651] focus:ring-[#008651]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
              <span>Catatan Penyerahan (Opsional)</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan klarifikasi angka cut-off atau lampiran..."
              className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-2xs placeholder:text-slate-400 focus:border-[#008651] focus:ring-1 focus:ring-[#008651]"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-slate-300 font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="pertamina"
              size="sm"
              disabled={loading}
              className="bg-[#008651] hover:bg-[#007244] text-white font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Submitting your report...</span>
                </>
              ) : (
                <span>{isResubmission ? "Submit Revisi" : "Submit Sekarang"}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      )}
    </Dialog>
  );
}
