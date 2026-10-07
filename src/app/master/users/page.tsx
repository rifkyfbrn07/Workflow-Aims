import React from "react";
import { getAllUsers } from "@/services/user-service";
import { MasterUsersClient } from "@/components/features/MasterUsersClient";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MasterUsersPage() {
  const users = await getAllUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#008651] text-white shadow-xs">
          <Users className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Master Pengguna &amp; Role</h1>
          <p className="text-xs text-slate-500">
            Daftar seluruh akun personil, role akses (Admin, User, PIC, Reviewer), dan departemen.
          </p>
        </div>
      </div>

      <MasterUsersClient initialUsers={users as any} />
    </div>
  );
}
