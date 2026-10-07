import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { scopeWhere } from "@/lib/submission-access";
import { getSubmissionArchive } from "@/services/submission-service";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const p = new URL(request.url).searchParams;
  const result = await getSubmissionArchive({ scope: scopeWhere(user), search: p.get("search") || undefined, status: p.get("status") as any || undefined, month: Number(p.get("month")) || undefined, year: Number(p.get("year")) || undefined, limit: 500 });
  const quote = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = ["Employee,Email,Report,Period,Deadline,Submission Date,Status,PIC,Reviewer,File Name"];
  result.items.forEach((s) => rows.push([s.submittedBy.name, s.submittedBy.email, s.reportPeriod.assignment.report.name, s.reportPeriod.periodLabel, s.reportPeriod.deadlineSubmit.toISOString(), s.submittedAt.toISOString(), s.status, s.reportPeriod.assignment.pic?.name, s.reportPeriod.assignment.reviewer?.name, s.fileName].map(quote).join(",")));
  return new NextResponse(rows.join("\n"), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=WorkTrack_Submissions.csv" } });
}
