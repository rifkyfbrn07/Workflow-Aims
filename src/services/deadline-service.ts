import { prisma } from "@/lib/prisma";
import { PeriodStatus } from "@prisma/client";
import { isPast, isBefore, addDays, startOfDay, endOfDay } from "date-fns";

export interface DeadlineCheckResult {
  updatedCount: number;
  overduePeriods: string[];
}

/**
 * Parses target day strings (e.g. "5", "9", "10 & 31", "2") and returns a Date object
 * for the target month and year.
 */
export function calculateDeadlineDate(
  year: number,
  monthIndex: number, // 0-indexed: 0 = Jan, 11 = Dec
  targetDayStr: string | null | undefined,
  isEndOfMonthFallback = false
): Date {
  let targetDay = 5; // default day 5

  if (targetDayStr) {
    // If target has multiple days like "10 & 31", use the primary (first or last)
    const match = targetDayStr.match(/\d+/);
    if (match) {
      targetDay = parseInt(match[0], 10);
    }
  }

  // Get max days in the target month
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const clampedDay = Math.min(targetDay, daysInMonth);

  // Set time to end of workday 17:00:00
  return new Date(year, monthIndex, clampedDay, 17, 0, 0, 0);
}

/**
 * Checks all active report periods and updates statuses based on current time
 * e.g., converts PENDING / IN_PROGRESS / REVISION to OVERDUE if deadline has passed.
 */
export async function syncPeriodStatuses(): Promise<DeadlineCheckResult> {
  const now = new Date();

  // Find all periods that are not completed (not SUBMITTED, UNDER_REVIEW, APPROVED)
  // and whose deadlineSubmit is in the past, but status is not yet OVERDUE
  const overdueCandidates = await prisma.reportPeriod.findMany({
    where: {
      status: {
        in: [PeriodStatus.PENDING, PeriodStatus.IN_PROGRESS, PeriodStatus.REVISION],
      },
      deadlineSubmit: {
        lt: now,
      },
    },
    select: {
      id: true,
      periodLabel: true,
      status: true,
    },
  });

  const overdueIds = overdueCandidates.map((p) => p.id);

  if (overdueIds.length > 0) {
    await prisma.reportPeriod.updateMany({
      where: {
        id: { in: overdueIds },
      },
      data: {
        status: PeriodStatus.OVERDUE,
      },
    });
  }

  return {
    updatedCount: overdueIds.length,
    overduePeriods: overdueIds,
  };
}
