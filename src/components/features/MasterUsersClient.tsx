"use client";

import React, { useState } from "react";
import { getAllUsers } from "@/services/user-service";
import { createUserAction } from "@/actions/worktrack-actions";
import { Users, Plus, Search, UserCheck, Shield, Mail, Building2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { UserRole } from "@prisma/client";
import { ROLE_LABELS, DEPARTMENTS } from "@/lib/constants";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string | null;
  active: boolean;
  _count: {
    assignedReports: number;
    picReports: number;
    reviewerReports: number;
    submissions: number;
  };
}

interface MasterUsersClientProps {
  initialUsers: UserItem[];
}

export function MasterUsersClient({ initialUsers }: MasterUsersClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("password123");
  const [formRole, setFormRole] = useState<UserRole>(UserRole.USER);
  const [formDept, setFormDept] = useState("SPBD");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      setError("Nama dan email wajib diisi.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createUserAction({
        name: formName.trim(),
        email: formEmail.trim(),
        password: formPassword,
        role: formRole,
        department: formDept,
      });

      if (res.success && res.user) {
        setUsers([
          {
            ...res.user,
            _count: { assignedReports: 0, picReports: 0, reviewerReports: 0, submissions: 0 },
          } as any,
          ...users,
        ]);
        setIsCreateOpen(false);
        setFormName("");
        setFormEmail("");
      }
    } catch (err: any) {
      setError(err.message || "Gagal membuat pengguna baru.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      (u.department || "").toLowerCase().includes(s) ||
      u.role.toLowerCase().includes(s)
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
            placeholder="Cari user, nama, email, departemen, atau role..."
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
          <span>Tambah Pengguna Baru</span>
        </Button>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4 min-w-[180px]">Nama Lengkap</th>
                <th className="py-3 px-3 min-w-[180px]">Email</th>
                <th className="py-3 px-3 min-w-[120px]">Departemen</th>
                <th className="py-3 px-3 min-w-[130px]">Role Akses</th>
                <th className="py-3 px-3 min-w-[140px]">Statistik Tugas</th>
                <th className="py-3 px-3 text-center min-w-[80px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((u, idx) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 text-center text-slate-400 font-mono">
                    {idx + 1}
                  </td>

                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-white font-bold text-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-600">
                    {u.email}
                  </td>

                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {u.department || "-"}
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800 border-purple-200"
                          : u.role === "PIC"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : u.role === "REVIEWER"
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-[11px] text-slate-500">
                    <div>Assignee: <strong>{u._count.assignedReports}</strong> laporan</div>
                    {u._count.picReports > 0 && <div>PIC: <strong>{u._count.picReports}</strong> laporan</div>}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Aktif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogHeader>
          <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          <DialogDescription>
            Menambahkan staf atau PIC baru ke dalam sistem WorkTrack.
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
            <label className="font-semibold text-slate-700">Nama Lengkap *</label>
            <Input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Email Perusahaan *</label>
            <Input
              type="email"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="budi@example.com"
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Role Sistem</label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as UserRole)}
                className="w-full h-9 px-3 text-xs rounded-md border border-slate-200 bg-white font-medium text-slate-800 focus:ring-1 focus:ring-blue-600"
              >
                <option value={UserRole.USER}>User / Assignee</option>
                <option value={UserRole.PIC}>Person In Charge (PIC)</option>
                <option value={UserRole.REVIEWER}>Reviewer / Approver</option>
                <option value={UserRole.ADMIN}>Administrator</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Departemen</label>
              <Input
                type="text"
                value={formDept}
                onChange={(e) => setFormDept(e.target.value)}
                placeholder="SPBD, SHG, dll"
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">Password Sementara</label>
            <Input
              type="password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              placeholder="password123"
              className="text-xs"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" variant="pertamina" size="sm" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Pengguna"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
