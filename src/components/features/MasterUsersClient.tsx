"use client";

import React, { useState } from "react";
import { UserRole } from "@prisma/client";
import { createUserAction } from "@/actions/worktrack-actions";
import { ROLE_LABELS } from "@/lib/constants";
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  User,
  Building2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string | null;
  active: boolean;
  createdAt: Date | string;
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
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("password123");
  const [formRole, setFormRole] = useState<UserRole>(UserRole.USER);
  const [formDept, setFormDept] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      setError("Nama lengkap dan email wajib diisi.");
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
        setFormPassword("password123");
        setFormDept("");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs transition-colors">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari user, nama, email, departemen, atau role..."
            className="pl-9 text-xs h-9 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
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
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0B132B] dark:bg-[#070D1C] text-white font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4 min-w-[180px]">Nama Lengkap</th>
                <th className="py-3 px-3 min-w-[180px]">Email Perusahaan</th>
                <th className="py-3 px-3 min-w-[120px]">Departemen</th>
                <th className="py-3 px-3 min-w-[130px]">Role Akses</th>
                <th className="py-3 px-3 min-w-[140px]">Statistik Tugas</th>
                <th className="py-3 px-3 text-center min-w-[80px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.map((u, idx) => (
                <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-3 text-center text-slate-400 dark:text-slate-500 font-mono">
                    {idx + 1}
                  </td>

                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 dark:bg-slate-700 text-white font-bold text-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                    {u.email}
                  </td>

                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {u.department || "-"}
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.role === "ADMIN"
                          ? "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                          : u.role === "PIC"
                          ? "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                          : u.role === "REVIEWER"
                          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                          : u.role === "MANAGEMENT"
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-[#008651] dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <div>Assignee: <strong className="text-slate-700 dark:text-slate-300">{u._count.assignedReports}</strong> laporan</div>
                    {u._count.picReports > 0 && <div>PIC: <strong className="text-slate-700 dark:text-slate-300">{u._count.picReports}</strong> laporan</div>}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-[#008651] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
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
            Menambahkan staf operasional atau PIC baru ke dalam portal sistem Nusantara Regas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4 py-2 text-xs">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Nama Lengkap *</label>
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
            <label className="font-semibold text-slate-700 dark:text-slate-300">Email Perusahaan *</label>
            <Input
              type="email"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="nama@nusantararegas.com"
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Role Sistem</label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as UserRole)}
                className="w-full h-9 px-3 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 font-medium text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-[#008651]"
              >
                <option value={UserRole.USER}>User / Assignee</option>
                <option value={UserRole.PIC}>Person In Charge (PIC)</option>
                <option value={UserRole.REVIEWER}>Reviewer / Approver</option>
                <option value={UserRole.MANAGEMENT}>Management (VP / Direksi)</option>
                <option value={UserRole.ADMIN}>Administrator</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Departemen</label>
              <Input
                type="text"
                value={formDept}
                onChange={(e) => setFormDept(e.target.value)}
                placeholder="Distribusi Gas, ORF, dll"
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Password Sementara</label>
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
