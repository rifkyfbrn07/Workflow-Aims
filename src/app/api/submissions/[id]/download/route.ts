import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canAccessSubmission } from "@/lib/submission-access";
import { logActivity } from "@/services/activity-service";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const access = await canAccessSubmission(user, id);
  if (!access.submission) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!access.allowed) return NextResponse.json({ error: "You don't have permission to access this file." }, { status: 403 });
  const source = access.submission.blobUrl || access.submission.fileUrl;
  if (!source) return NextResponse.json({ error: "No file is attached to this submission." }, { status: 404 });
  const upstream = await fetch(source);
  if (!upstream.ok || !upstream.body) return NextResponse.json({ error: "File is temporarily unavailable." }, { status: 502 });
  await logActivity({ userId: user.id, action: "DOWNLOAD", entityType: "SUBMISSION", entityId: id, metadata: { fileName: access.submission.fileName } });
  return new NextResponse(upstream.body, { headers: { "content-type": access.submission.mimeType || upstream.headers.get("content-type") || "application/octet-stream", "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(access.submission.fileName)}` } });
}
