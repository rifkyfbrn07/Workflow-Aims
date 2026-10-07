import { prisma } from "@/lib/prisma";
import { PeriodStatus, ReportFrequency, UserRole } from "@prisma/client";
import { calculateDeadlineDate, syncPeriodStatuses } from "./deadline-service";
import { MONTH_CODES, MONTH_NAMES } from "@/lib/constants";
import { logActivity } from "./activity-service";

export async function generatePeriodsForAssignment(assignmentId: string, year = 2026) {
  const assignment = await prisma.reportAssignment.findUnique({
    where: { id: assignmentId },
    include: { report: true },
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  const frequency = assignment.report.frequency;
  const createdPeriods = [];

  if (frequency === ReportFrequency.MONTHLY) {
    for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
      const monthLabel = `${MONTH_NAMES[monthIdx]} ${year}`;
      const periodStart = new Date(year, monthIdx, 1, 0, 0, 0);
      const periodEnd = new Date(year, monthIdx + 1, 0, 23, 59, 59);

      // Deadline submit
      const deadlineSubmit = calculateDeadlineDate(year, monthIdx, assignment.targetSubmit);

      // Deadline final (draft)
      const deadlineFinal = assignment.targetFinal
        ? calculateDeadlineDate(year, monthIdx, assignment.targetFinal)
        : null;

      // Meeting date
      let meetingDate: Date | null = null;
      if (assignment.meetingDate && assignment.meetingDate !== "N/A" && !isNaN(Number(assignment.meetingDate))) {
        meetingDate = calculateDeadlineDate(year, monthIdx, assignment.meetingDate);
      }

      // Upsert to prevent duplicate periods
      const period = await prisma.reportPeriod.upsert({
        where: {
          assignmentId_periodLabel: {
            assignmentId,
            periodLabel: monthLabel,
          },
        },
        update: {
          periodStart,
          periodEnd,
          deadlineSubmit,
          deadlineFinal,
          meetingDate,
        },
        create: {
          assignmentId,
          periodLabel: monthLabel,
          periodStart,
          periodEnd,
          deadlineSubmit,
          deadlineFinal,
          meetingDate,
          status: PeriodStatus.PENDING,
        },
      });
      createdPeriods.push(period);
    }
  } else if (frequency === ReportFrequency.QUARTERLY) {
    const quarters = [
      { label: `Q1 ${year}`, startMonth: 0, endMonth: 2, submitMonth: 2 },
      { label: `Q2 ${year}`, startMonth: 3, endMonth: 5, submitMonth: 5 },
      { label: `Q3 ${year}`, startMonth: 6, endMonth: 8, submitMonth: 8 },
      { label: `Q4 ${year}`, startMonth: 9, endMonth: 11, submitMonth: 11 },
    ];

    for (const q of quarters) {
      const periodStart = new Date(year, q.startMonth, 1, 0, 0, 0);
      const periodEnd = new Date(year, q.endMonth + 1, 0, 23, 59, 59);
      const deadlineSubmit = calculateDeadlineDate(year, q.submitMonth, assignment.targetSubmit);
      const deadlineFinal = assignment.targetFinal
        ? calculateDeadlineDate(year, q.submitMonth, assignment.targetFinal)
        : null;

      let meetingDate: Date | null = null;
      if (assignment.meetingDate && assignment.meetingDate !== "N/A" && !isNaN(Number(assignment.meetingDate))) {
        meetingDate = calculateDeadlineDate(year, q.submitMonth, assignment.meetingDate);
      }

      const period = await prisma.reportPeriod.upsert({
        where: {
          assignmentId_periodLabel: {
            assignmentId,
            periodLabel: q.label,
          },
        },
        update: {
          periodStart,
          periodEnd,
          deadlineSubmit,
          deadlineFinal,
          meetingDate,
        },
        create: {
          assignmentId,
          periodLabel: q.label,
          periodStart,
          periodEnd,
          deadlineSubmit,
          deadlineFinal,
          meetingDate,
          status: PeriodStatus.PENDING,
        },
      });
      createdPeriods.push(period);
    }
  }

  return createdPeriods;
}

export interface PeriodFilterOptions {
  search?: string;
  month?: string; // e.g. "Oktober 2026" or "10"
  userId?: string;
  picId?: string;
  reviewerId?: string;
  scopeUserId?: string;
  scopeRole?: UserRole | string;
  status?: PeriodStatus | string;
  frequency?: ReportFrequency | string;
  department?: string;
  limit?: number;
  skip?: number;
}

export async function getReportPeriods(options: PeriodFilterOptions = {}) {
  // Sync statuses first
  await syncPeriodStatuses();

  const where: Record<string, any> = {};

  if (options.status && options.status !== "ALL") {
    where.status = options.status as PeriodStatus;
  }

  if (options.month && options.month !== "ALL") {
    where.periodLabel = { contains: options.month, mode: "insensitive" };
  }

  // Filter on assignment relations
  const assignmentWhere: Record<string, any> = {};

  if (options.scopeUserId && options.scopeRole) {
    if (options.scopeRole === "USER") {
      assignmentWhere.userId = options.scopeUserId;
    } else if (options.scopeRole === "PIC") {
      assignmentWhere.OR = [
        { picId: options.scopeUserId },
        { userId: options.scopeUserId },
      ];
    } else if (options.scopeRole === "REVIEWER") {
      assignmentWhere.OR = [
        { reviewerId: options.scopeUserId },
        { userId: options.scopeUserId },
      ];
    }
  } else {
    if (options.userId && options.userId !== "ALL") {
      assignmentWhere.userId = options.userId;
    }
    if (options.picId && options.picId !== "ALL") {
      assignmentWhere.picId = options.picId;
    }
    if (options.reviewerId && options.reviewerId !== "ALL") {
      assignmentWhere.reviewerId = options.reviewerId;
    }
  }

  if (options.department && options.department !== "ALL") {
    assignmentWhere.user = {
      department: options.department,
    };
  }

  if (options.frequency && options.frequency !== "ALL") {
    assignmentWhere.report = {
      frequency: options.frequency as ReportFrequency,
    };
  }

  if (options.search) {
    const s = options.search.trim();
    assignmentWhere.OR = [
      { report: { name: { contains: s, mode: "insensitive" } } },
      { report: { description: { contains: s, mode: "insensitive" } } },
      { user: { name: { contains: s, mode: "insensitive" } } },
      { pic: { name: { contains: s, mode: "insensitive" } } },
      { reviewer: { name: { contains: s, mode: "insensitive" } } },
    ];
  }

  if (Object.keys(assignmentWhere).length > 0) {
    where.assignment = assignmentWhere;
  }

  const [periods, total] = await Promise.all([
    prisma.reportPeriod.findMany({
      where,
      include: {
        assignment: {
          include: {
            report: true,
            user: { select: { id: true, name: true, email: true, department: true } },
            pic: { select: { id: true, name: true, email: true, department: true } },
            reviewer: { select: { id: true, name: true, email: true, department: true } },
          },
        },
        submissions: {
          orderBy: { version: "desc" },
          take: 1,
          include: {
            submittedBy: { select: { id: true, name: true } },
            reviewedBy: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: [
        { deadlineSubmit: "asc" },
        { createdAt: "desc" },
      ],
      take: options.limit || 100,
      skip: options.skip || 0,
    }),
    prisma.reportPeriod.count({ where }),
  ]);

  return { periods, total };
}

export async function getPeriodById(id: string) {
  await syncPeriodStatuses();

  return prisma.reportPeriod.findUnique({
    where: { id },
    include: {
      assignment: {
        include: {
          report: true,
          user: true,
          pic: true,
          reviewer: true,
        },
      },
      submissions: {
        orderBy: { version: "asc" },
        include: {
          submittedBy: true,
          reviewedBy: true,
        },
      },
      notifications: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function startWorkingOnPeriod(periodId: string, userId: string) {
  const period = await prisma.reportPeriod.findUnique({
    where: { id: periodId },
    include: {
      assignment: { include: { report: true } },
    },
  });

  if (!period) throw new Error("Period not found");

  if (period.status === PeriodStatus.PENDING) {
    const updated = await prisma.reportPeriod.update({
      where: { id: periodId },
      data: { status: PeriodStatus.IN_PROGRESS },
    });

    await logActivity({
      userId,
      action: "TASK_STARTED",
      entityType: "PERIOD",
      entityId: periodId,
      metadata: {
        reportName: period.assignment.report.name,
        periodLabel: period.periodLabel,
      },
    });

    return updated;
  }

  return period;
}
