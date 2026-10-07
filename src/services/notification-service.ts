import { prisma } from "@/lib/prisma";
import { NotificationType, PeriodStatus } from "@prisma/client";
import { differenceInDays, isSameDay, startOfDay, isPast } from "date-fns";
import { logActivity } from "./activity-service";

export async function generateDeadlineNotifications(): Promise<{
  createdCount: number;
  details: string[];
}> {
  const now = new Date();
  const today = startOfDay(now);
  let createdCount = 0;
  const details: string[] = [];

  // 1. Fetch active report periods with assignees, PICs, and reports
  const activePeriods = await prisma.reportPeriod.findMany({
    where: {
      status: {
        in: [PeriodStatus.PENDING, PeriodStatus.IN_PROGRESS, PeriodStatus.REVISION, PeriodStatus.OVERDUE],
      },
    },
    include: {
      assignment: {
        include: {
          report: true,
          user: true,
          pic: true,
        },
      },
      notifications: true,
    },
  });

  for (const period of activePeriods) {
    const reportName = period.assignment.report.name;
    const assignee = period.assignment.user;
    const pic = period.assignment.pic;
    const deadline = period.deadlineSubmit;

    const diffDays = differenceInDays(startOfDay(deadline), today);
    const passed = isPast(deadline) && !isSameDay(deadline, now);

    // Existing notification types for this period
    const existingTypes = new Set(period.notifications.map((n) => n.type));

    // Case A: OVERDUE (Deadline already passed and still not submitted)
    if (passed || period.status === PeriodStatus.OVERDUE) {
      if (!existingTypes.has(NotificationType.OVERDUE)) {
        // Escalate to User & PIC
        const recipients = [assignee.id];
        if (pic?.id && pic.id !== assignee.id) recipients.push(pic.id);

        for (const uId of recipients) {
          await prisma.notification.create({
            data: {
              userId: uId,
              reportPeriodId: period.id,
              type: NotificationType.OVERDUE,
              title: "Pekerjaan Terlambat (Overdue)",
              message: `Laporan "${reportName}" (${period.periodLabel}) telah melewati batas waktu deadline submit. Segera lakukan submission.`,
              escalationLevel: 3,
            },
          });
          createdCount++;
        }
        details.push(`OVERDUE: ${reportName} (${period.periodLabel})`);
      }
    }
    // Case B: DEADLINE_TODAY (Hari H)
    else if (isSameDay(deadline, now) || diffDays === 0) {
      if (!existingTypes.has(NotificationType.DEADLINE_TODAY)) {
        const recipients = [assignee.id];
        if (pic?.id && pic.id !== assignee.id) recipients.push(pic.id);

        for (const uId of recipients) {
          await prisma.notification.create({
            data: {
              userId: uId,
              reportPeriodId: period.id,
              type: NotificationType.DEADLINE_TODAY,
              title: "Deadline Hari Ini",
              message: `Laporan "${reportName}" (${period.periodLabel}) batas waktu pengumpulan adalah HARI INI pukul 17:00.`,
              escalationLevel: 2,
            },
          });
          createdCount++;
        }
        details.push(`DEADLINE_TODAY: ${reportName} (${period.periodLabel})`);
      }
    }
    // Case C: DEADLINE_SOON (H-3 to H-1)
    else if (diffDays > 0 && diffDays <= 3) {
      if (!existingTypes.has(NotificationType.DEADLINE_SOON)) {
        // H-3 / H-1: User + PIC (if H-1)
        const recipients = [assignee.id];
        if (diffDays <= 1 && pic?.id && pic.id !== assignee.id) {
          recipients.push(pic.id);
        }

        for (const uId of recipients) {
          await prisma.notification.create({
            data: {
              userId: uId,
              reportPeriodId: period.id,
              type: NotificationType.DEADLINE_SOON,
              title: `Deadline ${diffDays} Hari Lagi`,
              message: `Pengingat: Laporan "${reportName}" (${period.periodLabel}) memiliki tenggat waktu dalam ${diffDays} hari.`,
              escalationLevel: diffDays <= 1 ? 2 : 1,
            },
          });
          createdCount++;
        }
        details.push(`DEADLINE_SOON (H-${diffDays}): ${reportName} (${period.periodLabel})`);
      }
    }
  }

  return { createdCount, details };
}

export async function notifySubmissionCreated(periodId: string, submissionId: string, submitterName: string) {
  const period = await prisma.reportPeriod.findUnique({
    where: { id: periodId },
    include: {
      assignment: {
        include: {
          report: true,
          pic: true,
          reviewer: true,
        },
      },
    },
  });

  if (!period) return;

  const { report, pic, reviewer } = period.assignment;
  const targetUserIds = new Set<string>();
  if (pic?.id) targetUserIds.add(pic.id);
  if (reviewer?.id) targetUserIds.add(reviewer.id);

  for (const targetId of targetUserIds) {
    await prisma.notification.create({
      data: {
        userId: targetId,
        reportPeriodId: period.id,
        type: NotificationType.SUBMITTED,
        title: "Pekerjaan Baru Disubmit",
        message: `${submitterName} telah melakukan submit untuk "${report.name}" (${period.periodLabel}). Silakan lakukan review.`,
        escalationLevel: 1,
      },
    });
  }
}

export async function notifyReviewDecision(
  periodId: string,
  decision: "APPROVED" | "REVISION",
  reviewerName: string,
  notes?: string
) {
  const period = await prisma.reportPeriod.findUnique({
    where: { id: periodId },
    include: {
      assignment: {
        include: {
          report: true,
          user: true,
        },
      },
    },
  });

  if (!period) return;

  const { report, user } = period.assignment;

  if (decision === "APPROVED") {
    await prisma.notification.create({
      data: {
        userId: user.id,
        reportPeriodId: period.id,
        type: NotificationType.APPROVED,
        title: "Pekerjaan Disetujui (Approved)",
        message: `Laporan "${report.name}" (${period.periodLabel}) telah disetujui oleh ${reviewerName}.`,
        escalationLevel: 1,
      },
    });
  } else {
    await prisma.notification.create({
      data: {
        userId: user.id,
        reportPeriodId: period.id,
        type: NotificationType.REVISION,
        title: "Permintaan Revisi Pekerjaan",
        message: `Laporan "${report.name}" (${period.periodLabel}) memerlukan revisi dari ${reviewerName}.${notes ? ` Catatan: "${notes}"` : ""}`,
        escalationLevel: 2,
      },
    });
  }
}

export async function getUserNotifications(userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
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
}

export async function markNotificationAsRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}
