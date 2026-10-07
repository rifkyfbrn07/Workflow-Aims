import { prisma } from "@/lib/prisma";
import { PeriodStatus } from "@prisma/client";
import { syncPeriodStatuses } from "./deadline-service";
import { MONTH_NAMES } from "@/lib/constants";

export async function getDashboardStats() {
  await syncPeriodStatuses();

  const now = new Date();

  const [
    totalPeriods,
    pendingCount,
    inProgressCount,
    submittedCount,
    underReviewCount,
    revisionCount,
    approvedCount,
    overdueCount,
    upcomingDeadlines,
    criticalOverdue,
    recentSubmissions,
    recentActivities,
  ] = await Promise.all([
    prisma.reportPeriod.count(),
    prisma.reportPeriod.count({ where: { status: PeriodStatus.PENDING } }),
    prisma.reportPeriod.count({ where: { status: PeriodStatus.IN_PROGRESS } }),
    prisma.reportPeriod.count({ where: { status: PeriodStatus.SUBMITTED } }),
    prisma.reportPeriod.count({ where: { status: PeriodStatus.UNDER_REVIEW } }),
    prisma.reportPeriod.count({ where: { status: PeriodStatus.REVISION } }),
    prisma.reportPeriod.count({ where: { status: PeriodStatus.APPROVED } }),
    prisma.reportPeriod.count({ where: { status: PeriodStatus.OVERDUE } }),

    // Top 8 upcoming deadlines (not completed)
    prisma.reportPeriod.findMany({
      where: {
        status: {
          in: [PeriodStatus.PENDING, PeriodStatus.IN_PROGRESS, PeriodStatus.REVISION],
        },
        deadlineSubmit: {
          gte: now,
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
      },
      orderBy: { deadlineSubmit: "asc" },
      take: 8,
    }),

    // Overdue list
    prisma.reportPeriod.findMany({
      where: {
        status: PeriodStatus.OVERDUE,
      },
      include: {
        assignment: {
          include: {
            report: true,
            user: true,
            pic: true,
          },
        },
      },
      orderBy: { deadlineSubmit: "asc" },
      take: 8,
    }),

    // Recent submissions
    prisma.submission.findMany({
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
      orderBy: { submittedAt: "desc" },
      take: 5,
    }),

    // Recent activity log
    prisma.activityLog.findMany({
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  // Distribution for Pie / Donut Chart
  const statusDistribution = [
    { name: "Pending", count: pendingCount, color: "#64748B" },
    { name: "In Progress", count: inProgressCount, color: "#0284C7" },
    { name: "Submitted", count: submittedCount, color: "#7C3AED" },
    { name: "Review", count: underReviewCount, color: "#D97706" },
    { name: "Revision", count: revisionCount, color: "#DC2626" },
    { name: "Approved", count: approvedCount, color: "#16A34A" },
    { name: "Overdue", count: overdueCount, color: "#E11D48" },
  ];

  // Monthly trend of submissions (Jan - Dec 2026)
  const allSubmissionsYear = await prisma.submission.findMany({
    select: {
      submittedAt: true,
      status: true,
    },
  });

  const monthlyTrend = MONTH_NAMES.map((monthName, idx) => {
    const submissionsInMonth = allSubmissionsYear.filter((s) => {
      const d = new Date(s.submittedAt);
      return d.getMonth() === idx;
    });

    const approvedInMonth = submissionsInMonth.filter((s) => s.status === "APPROVED").length;
    const revisionInMonth = submissionsInMonth.filter((s) => s.status === "REVISION").length;

    return {
      month: monthName.slice(0, 3),
      total: submissionsInMonth.length,
      approved: approvedInMonth,
      revision: revisionInMonth,
    };
  });

  // Build 12-Month Matrix Data for the Dashboard Program Matrix Table
  const activeReports = await prisma.report.findMany({
    where: { active: true },
    include: {
      assignments: {
        include: {
          user: true,
          pic: true,
          periods: {
            orderBy: { periodStart: "asc" },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const matrixData = activeReports.map((r) => {
    const mainAssignment = r.assignments[0];
    const periodsMap: Record<number, any> = {};

    mainAssignment?.periods.forEach((p) => {
      const d = new Date(p.periodStart);
      const mIdx = d.getMonth();
      periodsMap[mIdx] = {
        periodId: p.id,
        periodLabel: p.periodLabel,
        status: p.status,
        deadlineSubmit: p.deadlineSubmit,
      };
    });

    return {
      reportId: r.id,
      reportName: r.name,
      reportCode: r.code,
      department: mainAssignment?.user.department || r.defaultDepartment || "SPBD",
      picName: mainAssignment?.pic?.name || mainAssignment?.user?.name || "-",
      targetSubmitDay: mainAssignment?.targetSubmit || "5",
      periods: periodsMap,
    };
  });

  return {
    summary: {
      total: totalPeriods,
      pending: pendingCount,
      inProgress: inProgressCount,
      submitted: submittedCount,
      underReview: underReviewCount,
      revision: revisionCount,
      approved: approvedCount,
      overdue: overdueCount,
    },
    statusDistribution,
    monthlyTrend,
    upcomingDeadlines,
    criticalOverdue,
    recentSubmissions,
    recentActivities,
    matrixData,
  };
}

export async function getProgramMatrixData() {
  const activeReports = await prisma.report.findMany({
    where: { active: true },
    include: {
      assignments: {
        include: {
          user: true,
          pic: true,
          periods: {
            orderBy: { periodStart: "asc" },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return activeReports.map((r) => {
    const mainAssignment = r.assignments[0];
    const periodsMap: Record<number, any> = {};

    mainAssignment?.periods.forEach((p) => {
      const d = new Date(p.periodStart);
      const mIdx = d.getMonth();
      periodsMap[mIdx] = {
        periodId: p.id,
        periodLabel: p.periodLabel,
        status: p.status,
        deadlineSubmit: p.deadlineSubmit,
      };
    });

    return {
      reportId: r.id,
      reportName: r.name,
      reportCode: r.code,
      department: mainAssignment?.user.department || r.defaultDepartment || "SPBD",
      picName: mainAssignment?.pic?.name || mainAssignment?.user?.name || "-",
      targetSubmitDay: mainAssignment?.targetSubmit || "5",
      periods: periodsMap,
    };
  });
}

