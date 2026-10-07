import { prisma } from "@/lib/prisma";
import { generatePeriodsForAssignment } from "./period-service";
import { logActivity } from "./activity-service";

export interface CreateAssignmentInput {
  reportId: string;
  userId: string;
  picId?: string | null;
  reviewerId?: string | null;
  targetFinal?: string | null;
  targetSubmit?: string | null;
  meetingDate?: string | null;
  generatePeriodsYear?: number;
  adminId?: string;
}

export async function createAssignment(input: CreateAssignmentInput) {
  const assignment = await prisma.reportAssignment.create({
    data: {
      reportId: input.reportId,
      userId: input.userId,
      picId: input.picId || null,
      reviewerId: input.reviewerId || null,
      targetFinal: input.targetFinal || null,
      targetSubmit: input.targetSubmit || "5",
      meetingDate: input.meetingDate || null,
    },
    include: {
      report: true,
      user: true,
      pic: true,
      reviewer: true,
    },
  });

  // Automatically generate periods for this assignment for the target year (default 2026)
  const targetYear = input.generatePeriodsYear || 2026;
  await generatePeriodsForAssignment(assignment.id, targetYear);

  await logActivity({
    userId: input.adminId,
    action: "TASK_ASSIGNED",
    entityType: "ASSIGNMENT",
    entityId: assignment.id,
    metadata: {
      reportName: assignment.report.name,
      userName: assignment.user.name,
      picName: assignment.pic?.name,
      reviewerName: assignment.reviewer?.name,
      targetSubmit: assignment.targetSubmit,
    },
  });

  return assignment;
}

export async function updateAssignment(id: string, data: Partial<CreateAssignmentInput>) {
  const assignment = await prisma.reportAssignment.update({
    where: { id },
    data: {
      userId: data.userId,
      picId: data.picId,
      reviewerId: data.reviewerId,
      targetFinal: data.targetFinal,
      targetSubmit: data.targetSubmit,
      meetingDate: data.meetingDate,
    },
    include: {
      report: true,
      user: true,
      pic: true,
      reviewer: true,
    },
  });

  // Re-generate / update periods
  await generatePeriodsForAssignment(assignment.id, 2026);

  await logActivity({
    userId: data.adminId,
    action: "ASSIGNMENT_UPDATED",
    entityType: "ASSIGNMENT",
    entityId: id,
    metadata: {
      reportName: assignment.report.name,
      userName: assignment.user.name,
    },
  });

  return assignment;
}

export async function deleteAssignment(id: string, adminId?: string) {
  const assignment = await prisma.reportAssignment.delete({
    where: { id },
    include: { report: true, user: true },
  });

  await logActivity({
    userId: adminId,
    action: "ASSIGNMENT_DELETED",
    entityType: "ASSIGNMENT",
    entityId: id,
    metadata: {
      reportName: assignment.report.name,
      userName: assignment.user.name,
    },
  });

  return assignment;
}

export async function getAllAssignments() {
  return prisma.reportAssignment.findMany({
    include: {
      report: true,
      user: true,
      pic: true,
      reviewer: true,
      periods: {
        orderBy: { deadlineSubmit: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
