import { prisma } from "@/lib/prisma";
import { PeriodStatus, SubmissionStatus } from "@prisma/client";
import { logActivity } from "./activity-service";
import { notifyReviewDecision, notifySubmissionCreated } from "./notification-service";

export interface CreateSubmissionInput {
  reportPeriodId: string;
  submittedById: string;
  fileName: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  blobUrl?: string;
  blobPath?: string;
  notes?: string;
}

export async function createSubmission(input: CreateSubmissionInput) {
  const periodAccess = await prisma.reportPeriod.findUnique({
    where: { id: input.reportPeriodId },
    include: { assignment: true },
  });
  if (!periodAccess) throw new Error("Report period not found");
  const submitter = await prisma.user.findUnique({ where: { id: input.submittedById }, select: { role: true } });
  if (!submitter || (submitter.role !== "ADMIN" && periodAccess.assignment.userId !== input.submittedById)) {
    throw new Error("Forbidden");
  }
  // 1. Get current submission count to set version
  const existingSubmissionsCount = await prisma.submission.count({
    where: { reportPeriodId: input.reportPeriodId },
  });

  const version = existingSubmissionsCount + 1;
  const isResubmission = existingSubmissionsCount > 0;

  // 2. Create the submission record
  const submission = await prisma.submission.create({
    data: {
      reportPeriodId: input.reportPeriodId,
      submittedById: input.submittedById,
      fileName: input.fileName,
      fileUrl: input.fileUrl || null,
      fileSize: input.fileSize || null,
      mimeType: input.mimeType || null,
      blobUrl: input.blobUrl || null,
      blobPath: input.blobPath || null,
      notes: input.notes || null,
      status: SubmissionStatus.SUBMITTED,
      version: version,
    },
    include: {
      submittedBy: true,
      reportPeriod: {
        include: {
          assignment: {
            include: {
              report: true,
            },
          },
        },
      },
    },
  });

  // 3. Update the report period status to SUBMITTED
  await prisma.reportPeriod.update({
    where: { id: input.reportPeriodId },
    data: {
      status: PeriodStatus.SUBMITTED,
    },
  });

  // 4. Log activity
  const reportName = submission.reportPeriod.assignment.report.name;
  const periodLabel = submission.reportPeriod.periodLabel;
  const submitterName = submission.submittedBy.name;

  await logActivity({
    userId: input.submittedById,
    action: isResubmission ? "TASK_RESUBMITTED" : "TASK_SUBMITTED",
    entityType: "SUBMISSION",
    entityId: submission.id,
    metadata: {
      reportName,
      periodLabel,
      version,
      fileName: input.fileName,
      notes: input.notes,
    },
  });

  // 5. Notify PIC and Reviewer
  await notifySubmissionCreated(input.reportPeriodId, submission.id, submitterName);

  return submission;
}

export interface ReviewSubmissionInput {
  submissionId: string;
  reviewerId: string;
  decision: "APPROVED" | "REVISION" | "REJECTED";
  reviewNotes?: string;
}

export async function reviewSubmission(input: ReviewSubmissionInput) {
  const currentSubmission = await prisma.submission.findUnique({
    where: { id: input.submissionId },
    include: {
      submittedBy: true,
      reportPeriod: {
        include: {
          assignment: {
            include: {
              report: true,
            },
          },
        },
      },
    },
  });

  if (!currentSubmission) {
    throw new Error("Submission not found");
  }

  const reviewer = await prisma.user.findUnique({
    where: { id: input.reviewerId },
  });
  const assignment = currentSubmission.reportPeriod.assignment;
  if (!reviewer || (reviewer.role !== "ADMIN" && assignment.picId !== input.reviewerId && assignment.reviewerId !== input.reviewerId)) {
    throw new Error("Forbidden");
  }

  const reviewerName = reviewer?.name || "Reviewer";
  const now = new Date();

  let newSubmissionStatus: SubmissionStatus;
  let newPeriodStatus: PeriodStatus;

  if (input.decision === "APPROVED") {
    newSubmissionStatus = SubmissionStatus.APPROVED;
    newPeriodStatus = PeriodStatus.APPROVED;
  } else if (input.decision === "REVISION") {
    newSubmissionStatus = SubmissionStatus.REVISION;
    newPeriodStatus = PeriodStatus.REVISION;
  } else {
    newSubmissionStatus = SubmissionStatus.REJECTED;
    newPeriodStatus = PeriodStatus.REVISION;
  }

  // 1. Update Submission
  const updatedSubmission = await prisma.submission.update({
    where: { id: input.submissionId },
    data: {
      status: newSubmissionStatus,
      reviewedById: input.reviewerId,
      reviewedAt: now,
      reviewNotes: input.reviewNotes || null,
    },
    include: {
      submittedBy: true,
      reviewedBy: true,
    },
  });

  // 2. Update ReportPeriod
  await prisma.reportPeriod.update({
    where: { id: currentSubmission.reportPeriodId },
    data: {
      status: newPeriodStatus,
    },
  });

  // 3. Log Activity
  const reportName = currentSubmission.reportPeriod.assignment.report.name;
  const periodLabel = currentSubmission.reportPeriod.periodLabel;

  await logActivity({
    userId: input.reviewerId,
    action: input.decision === "APPROVED" ? "TASK_APPROVED" : "REVISION_REQUESTED",
    entityType: "SUBMISSION",
    entityId: input.submissionId,
    metadata: {
      reportName,
      periodLabel,
      decision: input.decision,
      reviewNotes: input.reviewNotes,
    },
  });

  // 4. Send Notification to Submitter
  if (input.decision === "APPROVED" || input.decision === "REVISION" || input.decision === "REJECTED") {
    await notifyReviewDecision(
      currentSubmission.reportPeriodId,
      input.decision === "APPROVED" ? "APPROVED" : "REVISION",
      reviewerName,
      input.reviewNotes
    );
  }

  return updatedSubmission;
}

export async function getSubmissionHistory(periodId: string) {
  return prisma.submission.findMany({
    where: { reportPeriodId: periodId },
    include: {
      submittedBy: {
        select: { id: true, name: true, email: true, department: true, role: true },
      },
      reviewedBy: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
    orderBy: { submittedAt: "asc" },
  });
}

export async function getAllSubmissions(options?: {
  status?: SubmissionStatus;
  limit?: number;
}) {
  const where: Record<string, any> = {};
  if (options?.status) where.status = options.status;

  return prisma.submission.findMany({
    where,
    include: {
      submittedBy: true,
      reviewedBy: true,
      reportPeriod: {
        include: {
          assignment: {
            include: {
              report: true,
              pic: true,
              reviewer: true,
            },
          },
        },
      },
    },
    orderBy: { submittedAt: "desc" },
    take: options?.limit || 50,
  });
}

export async function getSubmissionArchive(options: {
  scope?: Record<string, unknown>;
  search?: string; status?: SubmissionStatus; month?: number; year?: number; userId?: string;
  page?: number; limit?: number; sort?: "submittedAt" | "status" | "fileName"; direction?: "asc" | "desc";
}) {
  const { page = 1, limit = 20, search, status, month, year, userId, scope = {}, sort = "submittedAt", direction = "desc" } = options;
  const where: any = { ...scope };
  if (status) where.status = status;
  if (userId) where.submittedById = userId;
  if (month || year) {
    const start = new Date(year || 2000, (month || 1) - 1, 1);
    const end = month ? new Date(year || 2100, month, 1) : new Date((year || 2100) + 1, 0, 1);
    where.reportPeriod = { ...(where.reportPeriod || {}), periodStart: { gte: start, lt: end } };
  }
  if (search) where.OR = [
    { fileName: { contains: search, mode: "insensitive" } },
    { submittedBy: { name: { contains: search, mode: "insensitive" } } },
    { submittedBy: { email: { contains: search, mode: "insensitive" } } },
    { reportPeriod: { assignment: { report: { name: { contains: search, mode: "insensitive" } } } } },
  ];
  const include = { submittedBy: true, reviewedBy: true, reportPeriod: { include: { assignment: { include: { report: true, pic: true, reviewer: true } } } } };
  const [items, total] = await prisma.$transaction([
    prisma.submission.findMany({ where, include, orderBy: { [sort]: direction }, skip: (page - 1) * limit, take: limit }),
    prisma.submission.count({ where }),
  ]);
  return { items, total, page, limit };
}
