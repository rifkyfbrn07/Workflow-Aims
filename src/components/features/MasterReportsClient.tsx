"use client";

import React, { useState } from "react";
import { getAllReports } from "@/services/report-service";
import { createReportAction } from "@/actions/worktrack-actions";
import { FileText, Plus, Search, Building2, Calendar, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ReportFrequency } from "@prisma/client";

interface ReportItem {
  id: string;
  name: string;
  description?: string | null;
  code?: string | null;
  frequency: ReportFrequency;
  defaultDepartment?: string | null;
  active: boolean;
  assignments: Array<{
    id: string;
    user: { name: string };
    pic?: { name: string } | null;
    reviewer?: { name: string } | null;
  }>;
}

interface MasterReportsClientProps {
  initialReports: ReportItem[];
}

export function MasterReportsClient({ initialReports }: MasterReportsClientProps) {
  const [reports, setReports] = useState(initialReports);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formFrequency, setFormFrequency] = useState<ReportFrequency>(ReportFrequency.MONTHLY);
  const [formDepartment, setFormDepartment] = useState("SPBD");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError("Nama laporan wajib diisi.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createReportAction({
        name: formName.trim(),
        code: formCode.trim() || undefined,
        description: formDescription.trim() || undefined,
        frequency: formFrequency,
        defaultDepartment: formDepartment.trim() || undefined,
      });

      if (res.success && res.report) {
        setReports([
          {
            ...res.report,
            assignments: [],
          } as any,
          ...reports,
        ]);
        setIsCreateOpen(false);
        setFormName("");
        setFormCode("");
        setFormDescription("");
      }
    } catch (err: any) {
      setError(err.message || "Gagal membuat laporan master.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = reports.filter((r) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(s) ||
      (r.code || "").toLowerCase().includes(s) ||
      (r.defaultDepartment || "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Search & Create Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari master laporan, kode, atau departemen..."
            className="pl-9 text-xs h-9 bg-slate-50/50"
          />
        </div>

        <Button
          type="button"
          variant="pertamina"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Laporan Master</span>
        </Button>
      </div>

      {/* Reports Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4 min-w-[220px]">Nama Laporan Master</th>
                <th className="py-3 px-3 min-w-[100px]">Kode</th>
                <th className="py-3 px-3 min-w-[110px]">Frekuensi</th>
                <th className="py-3 px-3 min-w-[110px]">Departemen</th>
                <th className="py-3 px-3 min-w-[180px]">Penugasan (Assignment)</th>
                <th className="py-3 px-3 text-center min-w-[80px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium">Tidak ada master laporan ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 leading-snug">{r.name}</p>
                      {r.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {r.description}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600">
                      {r.code || "-"}
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {r.frequency}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {r.defaultDepartment || "SPBD"}
                    </td>

                    <td className="py-3 px-3">
                      {r.assignments.length === 0 ? (
                        <span className="text-slate-400 italic text-[11px]">Belum di-assign</span>
                      ) : (
                        <div className="space-y-0.5 text-[11px]">
                          {r.assignments.map((a, i) => (
                            <div key={a.id} className="text-slate-700">
                              • <strong>{a.user.name}</strong> (PIC: {a.pic?.name || "-"})
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Aktif
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogHeader>
          <DialogTitle>Tambah Master Laporan Baru</DialogTitle>
          <DialogDescription>
            Menambahkan jenis laporan baru ke katalog master perusahaan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4 py-2 text-xs">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Nama Laporan / Pekerjaan *</label>
            <Input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Contoh: Rekap Laporan Operasional Bulanan"
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Kode Laporan</label>
              <Input
                type="text"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="RPT-2026-XX"
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Frekuensi</label>
              <select
                value={formFrequency}
                onChange={(e) => setFormFrequency(e.target.value as ReportFrequency)}
                className="w-full h-9 px-3 text-xs rounded-md border border-slate-200 bg-white font-medium text-slate-800 focus:ring-1 focus:ring-blue-600"
              >
                <option value={ReportFrequency.MONTHLY}>Bulanan (Monthly - 12 Periode)</option>
                <option value={ReportFrequency.QUARTERLY}>Triwulanan (Quarterly - 4 Periode)</option>
                <option value={ReportFrequency.CUSTOM}>Khusus (Custom)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Departemen Terkait</label>
            <Input
              type="text"
              value={formDepartment}
              onChange={(e) => setFormDepartment(e.target.value)}
              placeholder="Contoh: SPBD, SHG, SEKPER, AIMM, ManRisk"
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Deskripsi &amp; Panduan</label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Panduan pengisian atau cut-off data..."
              className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs shadow-sm focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" variant="pertamina" size="sm" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Master Laporan"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
