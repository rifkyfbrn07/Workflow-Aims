"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, setAuthCookie, removeAuthCookie, verifyPassword, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSubmission, reviewSubmission } from "@/services/submission-service";
import { startWorkingOnPeriod } from "@/services/period-service";
import { markNotificationAsRead, markAllNotificationsAsRead, generateDeadlineNotifications } from "@/services/notification-service";
import { syncPeriodStatuses } from "@/services/deadline-service";
import { createReport, updateReport, deleteReport } from "@/services/report-service";
import { createAssignment, updateAssignment, deleteAssignment } from "@/services/assignment-service";
import { createUser, updateUser } from "@/services/user-service";
import { UserRole, ReportFrequency } from "@prisma/client";
import { logActivity } from "@/services/activity-service";

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email dan password wajib diisi." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.active) {
    return { success: false, error: "Akun tidak ditemukan atau tidak aktif." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: "Password salah." };
  }

  await setAuthCookie({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
  });

  await logActivity({ userId: user.id, action: "LOGIN", entityType: "USER", entityId: user.id, metadata: { email: user.email } });

  return { success: true };
}

export async function logoutAction() {
  const user = await getCurrentUser();
  if (user) await logActivity({ userId: user.id, action: "LOGOUT", entityType: "USER", entityId: user.id });
  await removeAuthCookie();
  redirect("/login");
}

export async function submitWorkAction(input: {
  periodId: string;
  fileName: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  blobUrl?: string;
  blobPath?: string;
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  if (!input.fileName || input.fileName.trim().length === 0) {
    throw new Error("Nama file atau berkas wajib diisi.");
  }

  const submission = await createSubmission({
    reportPeriodId: input.periodId,
    submittedById: user.id,
    fileName: input.fileName.trim(),
    fileUrl: input.fileUrl?.trim() || undefined,
    fileSize: input.fileSize,
    mimeType: input.mimeType,
    blobUrl: input.blobUrl,
    blobPath: input.blobPath,
    notes: input.notes?.trim() || undefined,
  });

  revalidatePath("/");
  revalidatePath("/jadwal");
  revalidatePath("/pekerjaan");
  revalidatePath(`/pekerjaan/${input.periodId}`);
  revalidatePath("/submissions");
  revalidatePath("/history");
  revalidatePath("/monitoring");

  return { success: true, submissionId: submission.id };
}

export async function reviewWorkAction(input: {
  submissionId: string;
  periodId: string;
  decision: "APPROVED" | "REVISION" | "REJECTED";
  reviewNotes?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  if (input.decision === "REVISION" && (!input.reviewNotes || input.reviewNotes.trim().length === 0)) {
    throw new Error("Catatan revisi wajib diisi jika meminta revisi.");
  }

  const updated = await reviewSubmission({
    submissionId: input.submissionId,
    reviewerId: user.id,
    decision: input.decision,
    reviewNotes: input.reviewNotes,
  });

  revalidatePath("/");
  revalidatePath("/jadwal");
  revalidatePath("/pekerjaan");
  revalidatePath(`/pekerjaan/${input.periodId}`);
  revalidatePath("/submissions");
  revalidatePath("/history");
  revalidatePath("/monitoring");

  return { success: true, submission: updated };
}

export async function startWorkAction(periodId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await startWorkingOnPeriod(periodId, user.id);

  revalidatePath("/");
  revalidatePath("/jadwal");
  revalidatePath("/pekerjaan");
  revalidatePath(`/pekerjaan/${periodId}`);

  return { success: true };
}

export async function markNotificationReadAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false };

  await markNotificationAsRead(id, user.id);
  revalidatePath("/notifikasi");
  return { success: true };
}

export async function markAllNotificationsReadAction() {
  const user = await getCurrentUser();
  if (!user) return { success: false };

  await markAllNotificationsAsRead(user.id);
  revalidatePath("/notifikasi");
  return { success: true };
}

export async function triggerDeadlineCheckAction() {
  await syncPeriodStatuses();
  const notifResult = await generateDeadlineNotifications();

  revalidatePath("/");
  revalidatePath("/jadwal");
  revalidatePath("/pekerjaan");
  revalidatePath("/monitoring");
  revalidatePath("/notifikasi");
}

export async function triggerDeadlineCheckFormAction(): Promise<void> {
  await triggerDeadlineCheckAction();
}

export async function markNotificationReadFormAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const id = formData.get("notificationId") as string;
  if (id) {
    await markNotificationAsRead(id, user.id);
    revalidatePath("/notifikasi");
  }
}

export async function markAllNotificationsReadFormAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await markAllNotificationsAsRead(user.id);
  revalidatePath("/notifikasi");
}

// Master Data Actions
export async function createReportAction(data: {
  name: string;
  description?: string;
  code?: string;
  frequency: ReportFrequency;
  defaultDepartment?: string;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Forbidden");

  const report = await createReport({ ...data, userId: user.id });
  revalidatePath("/master/reports");
  return { success: true, report };
}

export async function createAssignmentAction(data: {
  reportId: string;
  userId: string;
  picId?: string | null;
  reviewerId?: string | null;
  targetFinal?: string | null;
  targetSubmit?: string | null;
  meetingDate?: string | null;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Forbidden");

  const assignment = await createAssignment({ ...data, adminId: user.id });
  revalidatePath("/master/assignments");
  revalidatePath("/jadwal");
  revalidatePath("/");
  return { success: true, assignment };
}

export async function createUserAction(data: {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department?: string;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("Forbidden");

  const created = await createUser({ ...data, adminId: user.id });
  revalidatePath("/master/users");
  return { success: true, user: created };
}
