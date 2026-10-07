import { PrismaClient, UserRole, ReportFrequency, PeriodStatus, SubmissionStatus, NotificationType } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { calculateDeadlineDate } from "../src/services/deadline-service";
import { MONTH_CODES, MONTH_NAMES } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting WorkTrack Database Seeding...");

  // 1. Clear existing data in correct order
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.reportPeriod.deleteMany();
  await prisma.reportAssignment.deleteMany();
  await prisma.report.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash("password123", 10);

  // 2. Create Users
  console.log("Creating System & Staff Users...");
  const userDefinitions = [
    { name: "Administrator", email: "admin@example.com", role: UserRole.ADMIN, department: "IT & Management" },
    { name: "Rifky Fauzi (User)", email: "rifky@example.com", role: UserRole.USER, department: "SPBD" },
    { name: "User Operasional", email: "user@example.com", role: UserRole.USER, department: "Operasional" },
    { name: "Hudan (PIC)", email: "hudan@example.com", role: UserRole.PIC, department: "SHG" },
    { name: "Ito (PIC)", email: "ito@example.com", role: UserRole.PIC, department: "SPBD" },
    { name: "Dimas (PIC & Reviewer)", email: "dimas@example.com", role: UserRole.PIC, department: "ManRisk" },
    { name: "Sidiq (PIC & Reviewer)", email: "sidiq@example.com", role: UserRole.PIC, department: "SPBD" },
    { name: "Herman (Reviewer)", email: "herman@example.com", role: UserRole.REVIEWER, department: "Management" },
    // Department Accounts
    { name: "Divisi SHG", email: "shg@example.com", role: UserRole.USER, department: "SHG" },
    { name: "Divisi SEKPER", email: "sekper@example.com", role: UserRole.USER, department: "SEKPER" },
    { name: "Divisi SPBD", email: "spbd@example.com", role: UserRole.USER, department: "SPBD" },
    { name: "Holding Investment", email: "holding@example.com", role: UserRole.USER, department: "Holding" },
    { name: "Divisi ManRisk", email: "manrisk@example.com", role: UserRole.USER, department: "ManRisk" },
    { name: "Divisi AIMM", email: "aimm@example.com", role: UserRole.USER, department: "AIMM" },
    { name: "VP E&M", email: "vp.em@example.com", role: UserRole.USER, department: "VP E&M" },
    { name: "Divisi E&M", email: "em@example.com", role: UserRole.USER, department: "E&M" },
    { name: "Divisi Keuangan", email: "keuangan@example.com", role: UserRole.USER, department: "Keuangan" },
  ];

  const userMap: Record<string, string> = {};
  for (const u of userDefinitions) {
    const created = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        passwordHash: defaultPasswordHash,
        role: u.role,
        department: u.department,
        active: true,
      },
    });
    userMap[u.name.toLowerCase()] = created.id;
    userMap[u.email.toLowerCase()] = created.id;
    if (u.department) {
      userMap[u.department.toLowerCase()] = created.id;
    }
  }

  // Quick lookup helper for user by person / dept name
  const findUserId = (nameOrDept: string): string => {
    const key = nameOrDept.toLowerCase().trim();
    if (userMap[key]) return userMap[key];
    if (key.includes("hudan")) return userMap["hudan@example.com"];
    if (key.includes("ito")) return userMap["ito@example.com"];
    if (key.includes("dimas")) return userMap["dimas@example.com"];
    if (key.includes("sidiq")) return userMap["sidiq@example.com"];
    if (key.includes("herman")) return userMap["herman@example.com"];
    if (key.includes("shg")) return userMap["shg@example.com"];
    if (key.includes("sekper")) return userMap["sekper@example.com"];
    if (key.includes("spbd")) return userMap["spbd@example.com"];
    if (key.includes("holding")) return userMap["holding@example.com"];
    if (key.includes("manrisk")) return userMap["manrisk@example.com"];
    if (key.includes("aimm")) return userMap["aimm@example.com"];
    if (key.includes("vp e&m")) return userMap["vp.em@example.com"];
    if (key.includes("e&m")) return userMap["em@example.com"];
    if (key.includes("keuangan")) return userMap["keuangan@example.com"];
    return userMap["rifky@example.com"];
  };

  // 3. Load Master Reports from Extracted Excel Data
  console.log("Loading Excel Data & Creating Master Reports...");
  const jsonPath = path.join(__dirname, "../data/extracted_reports.json");
  const extractedData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

  // Filter only actual report rows (1-18)
  const reportRows = extractedData.filter(
    (item: any) => typeof item.no === "number" && item.description && item.description.length > 2
  );

  console.log(`Found ${reportRows.length} master reports in Excel dataset.`);

  const year = 2026;

  for (const row of reportRows) {
    // Determine frequency: if months Jan, Feb, Apr, May are null, it's Quarterly (Mar, Jun, Sep, Dec)
    const isQuarterly =
      row.months?.Jan?.plan === null &&
      row.months?.Feb?.plan === null &&
      row.months?.Mar?.plan !== null;

    const frequency = isQuarterly ? ReportFrequency.QUARTERLY : ReportFrequency.MONTHLY;

    const report = await prisma.report.create({
      data: {
        name: row.description,
        description: `Laporan operasional untuk ${row.user || "Departemen"}. Target Final: tgl ${row.target_final || "-"}, Target Submit: tgl ${row.target_submit || "-"}.`,
        code: `RPT-2026-${String(row.no).padStart(2, "0")}`,
        frequency: frequency,
        defaultDepartment: row.user || "SPBD",
      },
    });

    const assigneeId = findUserId(row.user || "SPBD");
    const picId = row.pic ? findUserId(row.pic) : userMap["dimas@example.com"];
    const reviewerId = row.reviewer ? findUserId(row.reviewer) : userMap["herman@example.com"];

    const assignment = await prisma.reportAssignment.create({
      data: {
        reportId: report.id,
        userId: assigneeId,
        picId: picId,
        reviewerId: reviewerId,
        targetFinal: row.target_final ? String(row.target_final) : "2",
        targetSubmit: row.target_submit ? String(row.target_submit) : "5",
        meetingDate: row.meeting_date ? String(row.meeting_date) : null,
      },
    });

    // 4. Generate 2026 Periods & Seed Historical/Current Workflow Data
    if (frequency === ReportFrequency.MONTHLY) {
      for (let mIdx = 0; mIdx < 12; mIdx++) {
        const mCode = MONTH_CODES[mIdx];
        const periodLabel = `${MONTH_NAMES[mIdx]} ${year}`;
        const periodStart = new Date(year, mIdx, 1, 0, 0, 0);
        const periodEnd = new Date(year, mIdx + 1, 0, 23, 59, 59);
        const deadlineSubmit = calculateDeadlineDate(year, mIdx, assignment.targetSubmit);
        const deadlineFinal = assignment.targetFinal
          ? calculateDeadlineDate(year, mIdx, assignment.targetFinal)
          : null;

        let meetingDate: Date | null = null;
        if (assignment.meetingDate && assignment.meetingDate !== "N/A" && !isNaN(Number(assignment.meetingDate))) {
          meetingDate = calculateDeadlineDate(year, mIdx, assignment.meetingDate);
        }

        const excelMonth = row.months?.[mCode];
        const aktualVal = excelMonth?.aktual;

        let periodStatus: PeriodStatus = PeriodStatus.PENDING;

        // Past months (Jan - Sep 2026)
        if (mIdx < 9) {
          if (aktualVal !== null && aktualVal !== undefined && aktualVal !== "N/A") {
            periodStatus = PeriodStatus.APPROVED;
          } else if (excelMonth?.plan) {
            // Plan existed but no actual -> either submitted or overdue in past
            periodStatus = row.no % 3 === 0 ? PeriodStatus.APPROVED : PeriodStatus.OVERDUE;
          }
        }
        // Current month: October 2026 (mIdx = 9) - Rich testing scenarios
        else if (mIdx === 9) {
          if (row.no === 1) periodStatus = PeriodStatus.APPROVED;
          else if (row.no === 2) periodStatus = PeriodStatus.UNDER_REVIEW;
          else if (row.no === 3) periodStatus = PeriodStatus.REVISION;
          else if (row.no === 4) periodStatus = PeriodStatus.SUBMITTED;
          else if (row.no === 5) periodStatus = PeriodStatus.IN_PROGRESS;
          else if (row.no === 6) periodStatus = PeriodStatus.OVERDUE;
          else if (row.no === 7) periodStatus = PeriodStatus.PENDING;
          else if (row.no === 8) periodStatus = PeriodStatus.IN_PROGRESS;
          else if (row.no === 9) periodStatus = PeriodStatus.SUBMITTED;
          else if (row.no === 10) periodStatus = PeriodStatus.PENDING;
          else periodStatus = PeriodStatus.PENDING;
        }
        // Future months: Nov, Dec 2026
        else {
          periodStatus = PeriodStatus.PENDING;
        }

        const period = await prisma.reportPeriod.create({
          data: {
            assignmentId: assignment.id,
            periodLabel,
            periodStart,
            periodEnd,
            deadlineSubmit,
            deadlineFinal,
            meetingDate,
            status: periodStatus,
          },
        });

        // Create Submissions for APPROVED, UNDER_REVIEW, REVISION, SUBMITTED
        if (periodStatus === PeriodStatus.APPROVED) {
          const submitDay = typeof aktualVal === "number" ? aktualVal : 5;
          const submitDate = new Date(year, mIdx, Math.min(submitDay, 28), 14, 30, 0);

          await prisma.submission.create({
            data: {
              reportPeriodId: period.id,
              submittedById: assigneeId,
              submittedAt: submitDate,
              status: SubmissionStatus.APPROVED,
              version: 1,
              fileName: `${report.name.replace(/[^a-zA-Z0-9]/g, "_")}_${mCode}_${year}.xlsx`,
              fileUrl: "https://onedrive.live.com/view/sample-report.xlsx",
              notes: "Laporan bulanan telah rampung dan data telah divalidasi sesuai cut-off.",
              reviewedById: reviewerId,
              reviewedAt: new Date(submitDate.getTime() + 24 * 3600 * 1000),
              reviewNotes: "Laporan telah ditinjau dan disetujui tanpa catatan.",
            },
          });
        } else if (periodStatus === PeriodStatus.UNDER_REVIEW) {
          const submitDate = new Date(year, mIdx, 4, 11, 20, 0);
          await prisma.submission.create({
            data: {
              reportPeriodId: period.id,
              submittedById: assigneeId,
              submittedAt: submitDate,
              status: SubmissionStatus.UNDER_REVIEW,
              version: 1,
              fileName: `${report.name.replace(/[^a-zA-Z0-9]/g, "_")}_${mCode}_${year}.xlsx`,
              fileUrl: "https://onedrive.live.com/view/sample-report.xlsx",
              notes: "Draft laporan Oktober telah diunggah. Mohon review PIC/Reviewer.",
            },
          });
        } else if (periodStatus === PeriodStatus.REVISION) {
          // Version 1 (Revision requested)
          const submitDateV1 = new Date(year, mIdx, 2, 10, 0, 0);
          await prisma.submission.create({
            data: {
              reportPeriodId: period.id,
              submittedById: assigneeId,
              submittedAt: submitDateV1,
              status: SubmissionStatus.REVISION,
              version: 1,
              fileName: `${report.name.replace(/[^a-zA-Z0-9]/g, "_")}_${mCode}_${year}_v1.xlsx`,
              notes: "Submission awal periode Oktober.",
              reviewedById: picId,
              reviewedAt: new Date(year, mIdx, 3, 14, 15, 0),
              reviewNotes: "Tolong perbaiki data lampiran tabel 3 dan rekapitulasi realisasi anggaran minggu ke-3.",
            },
          });
        } else if (periodStatus === PeriodStatus.SUBMITTED) {
          const submitDate = new Date(year, mIdx, 5, 9, 45, 0);
          await prisma.submission.create({
            data: {
              reportPeriodId: period.id,
              submittedById: assigneeId,
              submittedAt: submitDate,
              status: SubmissionStatus.SUBMITTED,
              version: 1,
              fileName: `${report.name.replace(/[^a-zA-Z0-9]/g, "_")}_${mCode}_${year}.xlsx`,
              notes: "Laporan telah lengkap beserta bukti dukung screenshot.",
            },
          });
        }
      }
    } else {
      // QUARTERLY
      const quarters = [
        { label: `Q1 ${year}`, startMonth: 0, endMonth: 2, submitMonth: 2, mCode: "Mar" },
        { label: `Q2 ${year}`, startMonth: 3, endMonth: 5, submitMonth: 5, mCode: "Jun" },
        { label: `Q3 ${year}`, startMonth: 6, endMonth: 8, submitMonth: 8, mCode: "Sep" },
        { label: `Q4 ${year}`, startMonth: 9, endMonth: 11, submitMonth: 11, mCode: "Dec" },
      ];

      for (let qIdx = 0; qIdx < quarters.length; qIdx++) {
        const q = quarters[qIdx];
        const periodStart = new Date(year, q.startMonth, 1, 0, 0, 0);
        const periodEnd = new Date(year, q.endMonth + 1, 0, 23, 59, 59);
        const deadlineSubmit = calculateDeadlineDate(year, q.submitMonth, assignment.targetSubmit);
        const deadlineFinal = assignment.targetFinal
          ? calculateDeadlineDate(year, q.submitMonth, assignment.targetFinal)
          : null;

        let status: PeriodStatus = PeriodStatus.PENDING;
        if (qIdx < 2) status = PeriodStatus.APPROVED;
        else if (qIdx === 2) status = PeriodStatus.APPROVED;
        else status = PeriodStatus.PENDING;

        const period = await prisma.reportPeriod.create({
          data: {
            assignmentId: assignment.id,
            periodLabel: q.label,
            periodStart,
            periodEnd,
            deadlineSubmit,
            deadlineFinal,
            status,
          },
        });

        if (status === PeriodStatus.APPROVED) {
          await prisma.submission.create({
            data: {
              reportPeriodId: period.id,
              submittedById: assigneeId,
              submittedAt: new Date(year, q.submitMonth, 9, 15, 0, 0),
              status: SubmissionStatus.APPROVED,
              version: 1,
              fileName: `${report.name.replace(/[^a-zA-Z0-9]/g, "_")}_${q.label}.xlsx`,
              notes: `Laporan triwulanan ${q.label} selesai.`,
              reviewedById: reviewerId,
              reviewedAt: new Date(year, q.submitMonth, 10, 10, 0, 0),
              reviewNotes: "Approved. Data sesuai.",
            },
          });
        }
      }
    }
  }

  // 5. Create Sample Notifications
  console.log("Creating Notifications & Escalation Demo Data...");
  const sampleNotifications = [
    {
      userId: userMap["rifky@example.com"],
      type: NotificationType.DEADLINE_TODAY,
      title: "Deadline Hari Ini!",
      message: "Laporan Monev BOD BOC (Oktober 2026) batas waktu pengumpulan adalah HARI INI.",
      escalationLevel: 2,
    },
    {
      userId: userMap["rifky@example.com"],
      type: NotificationType.REVISION,
      title: "Permintaan Revisi dari PIC",
      message: "Laporan Monev SHG (Internal - SPBD) memerlukan revisi: 'Data minggu ke-3 belum lengkap'.",
      escalationLevel: 2,
    },
    {
      userId: userMap["hudan@example.com"],
      type: NotificationType.SUBMITTED,
      title: "Laporan Baru Disubmit",
      message: "Divisi SHG telah melakukan submit untuk 'TKDN (SHG)' (Oktober 2026). Silakan review.",
      escalationLevel: 1,
    },
    {
      userId: userMap["admin@example.com"],
      type: NotificationType.OVERDUE,
      title: "Pekerjaan Terlambat (Overdue)",
      message: "Realisasi Investasi ke Holding (Oktober 2026) telah melewati batas deadline pengumpulan.",
      escalationLevel: 3,
    },
    {
      userId: userMap["rifky@example.com"],
      type: NotificationType.APPROVED,
      title: "Laporan Telah Disetujui",
      message: "Laporan TKDN (SHG) (September 2026) telah disetujui oleh Reviewer Dimas.",
      escalationLevel: 1,
    },
  ];

  for (const notif of sampleNotifications) {
    await prisma.notification.create({
      data: {
        userId: notif.userId,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        read: false,
        escalationLevel: notif.escalationLevel,
      },
    });
  }

  // 6. Create Sample Activity Logs
  console.log("Creating Activity Log Trail...");
  const sampleActivities = [
    { action: "TASK_APPROVED", entityType: "SUBMISSION" as const, entityId: "sub-demo-1", userId: userMap["dimas@example.com"], metadata: { reportName: "TKDN (SHG)", periodLabel: "September 2026" } },
    { action: "REVISION_REQUESTED", entityType: "SUBMISSION" as const, entityId: "sub-demo-2", userId: userMap["sidiq@example.com"], metadata: { reportName: "Laporan Monev SHG", periodLabel: "Oktober 2026", note: "Perbaiki tabel 3" } },
    { action: "TASK_SUBMITTED", entityType: "SUBMISSION" as const, entityId: "sub-demo-3", userId: userMap["rifky@example.com"], metadata: { reportName: "Monev BOD BOC", periodLabel: "Oktober 2026", fileName: "monev_bod_boc_okt2026.xlsx" } },
    { action: "TASK_STARTED", entityType: "PERIOD" as const, entityId: "period-demo-4", userId: userMap["rifky@example.com"], metadata: { reportName: "Investasi SIIP", periodLabel: "Oktober 2026" } },
    { action: "TASK_ASSIGNED", entityType: "ASSIGNMENT" as const, entityId: "assign-demo-5", userId: userMap["admin@example.com"], metadata: { reportName: "Project Risk", userName: "Divisi ManRisk", picName: "Ito" } },
  ];

  for (const act of sampleActivities) {
    await prisma.activityLog.create({
      data: {
        action: act.action,
        entityType: act.entityType,
        entityId: act.entityId,
        userId: act.userId,
        metadata: act.metadata,
      },
    });
  }

  console.log("✅ Seed completed successfully with Excel master dataset & full workflow testing states!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
