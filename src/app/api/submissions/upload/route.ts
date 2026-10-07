import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToBlob } from "@/lib/blob-storage";
import { createSubmission } from "@/services/submission-service";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const formData = await request.formData();
    const periodId = String(formData.get("periodId") || "");
    const notes = String(formData.get("notes") || "");
    const file = formData.get("file");
    if (!periodId || !(file instanceof File)) return NextResponse.json({ error: "A report period and file are required." }, { status: 400 });

    const period = await prisma.reportPeriod.findUnique({
      where: { id: periodId },
      include: { assignment: { include: { report: true, user: true } } },
    });
    if (!period) return NextResponse.json({ error: "Report period not found." }, { status: 404 });
    if (user.role !== "ADMIN" && period.assignment.userId !== user.id) return NextResponse.json({ error: "You don't have permission to submit for this report." }, { status: 403 });
    const stored = await uploadToBlob(file, { year: period.periodStart.getFullYear(), month: period.periodLabel, report: period.assignment.report.name, employee: user.name });
    const submission = await createSubmission({
      reportPeriodId: period.id, submittedById: user.id, fileName: file.name, fileSize: file.size,
      mimeType: file.type, blobUrl: stored.url, blobPath: stored.path, notes: notes || undefined,
    });
    return NextResponse.json({ id: submission.id, fileName: submission.fileName }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "We couldn't upload this file.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
