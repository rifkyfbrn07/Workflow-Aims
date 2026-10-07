"use client";

import React, { useState } from "react";
import { createAssignmentAction } from "@/actions/worktrack-actions";
import { UserCheck, Plus, Search, Calendar, Shield, CheckCircle2, User, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface AssignmentItem {
  id: string;
  targetFinal?: string | null;
  targetSubmit?: string | null;
  meetingDate?: string | null;
  createdAt: Date | string;
  report: {
    id: string;
    name: string;
    frequency: string;
    defaultDepartment?: string | null;
  };
  user: {
    id: string;
    name: string;
    department?: string | null;
  };
  pic?: {
    id: string;
    name: string;
  } | null;
  reviewer?: {
    id: string;
    name: string;
  } | null;
  periods: Array<{
    id: string;
    periodLabel: string;
    status: string;
  }>;
}

interface UserOption {
  id: string;
  name: string;
  department?: string | null;
  role: string;
}

interface ReportOption {
  id: string;
  name: string;
  frequency: string;
  defaultDepartment?: string | null;
}

interface MasterAssignmentsClientProps {
  initialAssignments: AssignmentItem[];
  availableUsers: UserOption[];
  availableReports: ReportOption[];
}

export function MasterAssignmentsClient({
  initialAssignments,
  availableUsers,
  availableReports,
}: MasterAssignmentsClientProps) {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formReportId, setFormReportId] = useState(availableReports[0]?.id || "");
  const [formUserId, setFormUserId] = useState(availableUsers[0]?.id || "");
  const [formPicId, setFormPicId] = useState(availableUsers[0]?.id || "");
  const [formReviewerId, setFormReviewerId] = useState(availableUsers[0]?.id || "");
  const [formTargetFinal, setFormTargetFinal] = useState("2");
  const [formTargetSubmit, setFormTargetSubmit] = useState("5");
  const [formMeetingDate, setFormMeetingDate] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formReportId || !formUserId) {
      setError("Pilih laporan dan user assignee.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createAssignmentAction({
        reportId: formReportId,
        userId: formUserId,
        picId: formPicId || null,
        reviewerId: formReviewerId || null,
        targetFinal: formTargetFinal || null,
        targetSubmit: formTargetSubmit || "5",
        meetingDate: formMeetingDate || null,
      });

      if (res.success && res.assignment) {
        setAssignments([res.assignment as any, ...assignments]);
        setIsCreateOpen(false);
      }
    } catch (err: any) {
      setError(err.message || "Gagal membuat penugasan.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = assignments.filter((a) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      a.report.name.toLowerCase().includes(s) ||
      a.user.name.toLowerCase().includes(s) ||
      (a.pic?.name || "").toLowerCase().includes(s) ||
      (a.reviewer?.name || "").toLowerCase().includes(s)
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
            placeholder="Cari assignment, laporan, user, atau PIC..."
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
          <span>Buat Penugasan Baru</span>
        </Button>
      </div>

      {/* Assignments Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4 min-w-[220px]">Laporan Master</th>
                <th className="py-3 px-3 min-w-[130px]">User Assignee</th>
                <th className="py-3 px-3 min-w-[110px]">PIC</th>
                <th className="py-3 px-3 min-w-[110px]">Reviewer</th>
                <th className="py-3 px-2 text-center w-24">Target Draft</th>
                <th className="py-3 px-2 text-center w-24">Target Submit</th>
                <th className="py-3 px-2 text-center w-24">Meeting</th>
                <th className="py-3 px-3 min-w-[120px]">Periode Dibuat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((a, idx) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 text-center text-slate-400 font-mono">
                    {idx + 1}
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{a.report.name}</p>
                    <span className="text-[10px] text-blue-600 font-semibold uppercase">
                      {a.report.frequency} • {a.report.defaultDepartment || "SPBD"}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-semibold text-slate-900">
                    <div>{a.user.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{a.user.department || "-"}</div>
                  </td>

                  <td className="py-3 px-3 font-medium text-slate-800">
                    {a.pic?.name || "-"}
                  </td>

                  <td className="py-3 px-3 text-slate-600">
                    {a.reviewer?.name || "-"}
                  </td>

                  <td className="py-3 px-2 text-center font-mono font-medium text-slate-700">
                    Tgl {a.targetFinal || "-"}
                  </td>

                  <td className="py-3 px-2 text-center font-mono font-bold text-blue-700">
                    Tgl {a.targetSubmit || "5"}
                  </td>

                  <td className="py-3 px-2 text-center font-mono text-slate-500">
                    {a.meetingDate && a.meetingDate !== "N/A" ? `Tgl ${a.meetingDate}` : "-"}
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {a.periods?.length || 12} Periode (2026)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Assignment Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogHeader>
          <DialogTitle>Buat Penugasan (Assignment) Baru</DialogTitle>
          <DialogDescription>
            Menghubungkan master laporan dengan user pelaksana, PIC, reviewer, serta target cut-off tanggal. Periode 2026 akan di-generate otomatis.
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
            <label className="font-semibold text-slate-700">Pilih Master Laporan *</label>
            <select
              value={formReportId}
              onChange={(e) => setFormReportId(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-md border border-slate-200 bg-white font-medium text-slate-800 focus:ring-1 focus:ring-blue-600"
            >
              {availableReports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.frequency} - {r.defaultDepartment || "SPBD"})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Pilih User Pelaksana (Assignee) *</label>
            <select
              value={formUserId}
              onChange={(e) => setFormUserId(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-md border border-slate-200 bg-white font-medium text-slate-800 focus:ring-1 focus:ring-blue-600"
            >
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.department || u.role})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">PIC Penanggung Jawab</label>
              <select
                value={formPicId}
                onChange={(e) => setFormPicId(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-md border border-slate-200 bg-white font-medium text-slate-800 focus:ring-1 focus:ring-blue-600"
              >
                <option value="">- Tanpa PIC -</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Reviewer / Approver</label>
              <select
                value={formReviewerId}
                onChange={(e) => setFormReviewerId(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-md border border-slate-200 bg-white font-medium text-slate-800 focus:ring-1 focus:ring-blue-600"
              >
                <option value="">- Tanpa Reviewer -</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Target Draft (Final)</label>
              <Input
                type="text"
                value={formTargetFinal}
                onChange={(e) => setFormTargetFinal(e.target.value)}
                placeholder="2"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Target Submit *</label>
              <Input
                type="text"
                required
                value={formTargetSubmit}
                onChange={(e) => setFormTargetSubmit(e.target.value)}
                placeholder="5"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Tanggal Meeting</label>
              <Input
                type="text"
                value={formMeetingDate}
                onChange={(e) => setFormMeetingDate(e.target.value)}
                placeholder="12 atau N/A"
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" variant="pertamina" size="sm" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan & Generate Periode"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
