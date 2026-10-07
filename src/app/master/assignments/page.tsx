import React from "react";
import { getAllAssignments } from "@/services/assignment-service";
import { getAllUsers } from "@/services/user-service";
import { getAllReports } from "@/services/report-service";
import { MasterAssignmentsClient } from "@/components/features/MasterAssignmentsClient";
import { UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MasterAssignmentsPage() {
  const [assignments, users, reports] = await Promise.all([
    getAllAssignments(),
    getAllUsers(),
    getAllReports(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#008651] text-white shadow-xs">
          <UserCheck className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Matriks Penugasan Laporan (Assignments)
          </h1>
          <p className="text-xs text-slate-500">
            Pengaturan penugasan setiap laporan kepada user pelaksana, PIC penanggung jawab, reviewer, dan target cut-off individual.
          </p>
        </div>
      </div>

      <MasterAssignmentsClient
        initialAssignments={assignments as any}
        availableUsers={users as any}
        availableReports={reports as any}
      />
    </div>
  );
}
