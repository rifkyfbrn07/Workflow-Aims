/**
 * Idempotent Demonstration Accounts & Operational Workflow Seeding
 *
 * This script is strictly idempotent:
 * - Does NOT delete, truncate, or reset existing employee data.
 * - Upserts dedicated demo accounts for each supported role:
 *     1. ADMIN       (demo.admin@nusantararegas.com)
 *     2. USER        (demo.user@nusantararegas.com)
 *     3. PIC         (demo.pic@nusantararegas.com)
 *     4. REVIEWER    (demo.reviewer@nusantararegas.com)
 *     5. MANAGEMENT  (demo.management@nusantararegas.com)
 * - Safely attaches realistic, labeled [DEMO] reports, periods, submissions,
 *   notifications, and audit logs to showcase every status badge and workflow state.
 */
import {
  PrismaClient,
  UserRole,
  ReportFrequency,
  PeriodStatus,
  SubmissionStatus,
  NotificationType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || "DemoRegas2026!";

export const DEMO_ACCOUNTS = [
  {
    name: "Demo Administrator",
    email: "demo.admin@nusantararegas.com",
    role: UserRole.ADMIN,
    department: "IT & Digital Solution",
    description: "Akses penuh konfigurasi sistem, master data laporan, penugasan, dan manajemen user.",
  },
  {
    name: "Demo Operasional Staff (User)",
    email: "demo.user@nusantararegas.com",
    role: UserRole.USER,
    department: "Distribusi Gas",
    description: "Penyusun laporan: mengunggah berkas, menindaklanjuti revisi, dan memantau deadline tugas.",
  },
  {
    name: "Demo Person In Charge (PIC)",
    email: "demo.pic@nusantararegas.com",
    role: UserRole.PIC,
    department: "Operasional ORF",
    description: "Verifikator tahap satu: meninjau berkas submission, meminta revisi, atau meneruskan ke reviewer.",
  },
  {
    name: "Demo Reviewer",
    email: "demo.reviewer@nusantararegas.com",
    role: UserRole.REVIEWER,
    department: "Manajemen Kepatuhan",
    description: "Pemberi persetujuan akhir (final approval) dan evaluasi kepatuhan jadwal.",
  },
  {
    name: "Demo Management (VP / Direksi)",
    email: "demo.management@nusantararegas.com",
    role: UserRole.MANAGEMENT,
    department: "Executive Management",
    description: "Pemantau eksekutif: ringkasan progres bulanan, tingkat kepatuhan (compliance), dan tren divisi.",
  },
];

export async function seedDemoAccounts() {
  console.log("🚀 Starting Idempotent Demo Accounts Seeding...");

  // 1. Upsert Demo Users
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const userMap: Record<string, string> = {};

  for (const acc of DEMO_ACCOUNTS) {
    const user = await prisma.user.upsert({
      where: { email: acc.email },
      update: {
        name: acc.name,
        passwordHash,
        role: acc.role,
        department: acc.department,
        active: true,
      },
      create: {
        name: acc.name,
        email: acc.email,
        passwordHash,
        role: acc.role,
        department: acc.department,
        active: true,
      },
    });
    userMap[acc.email] = user.id;
    console.log(`✓ Upserted ${acc.role}: ${acc.email}`);
  }

  const adminId = userMap["demo.admin@nusantararegas.com"];
  const userId = userMap["demo.user@nusantararegas.com"];
  const picId = userMap["demo.pic@nusantararegas.com"];
  const reviewerId = userMap["demo.reviewer@nusantararegas.com"];
  const managementId = userMap["demo.management@nusantararegas.com"];

  // 2. Upsert Demo Master Report
  const demoReport = await prisma.report.upsert({
    where: { id: "00000000-demo-0000-0000-000000000001" },
    update: {
      name: "[DEMO] Laporan Monitoring Tekanan & Penyaluran Gas ORF",
      description: "Data sintetis percontohan sistem pelaporan operasional harian & bulanan Onshore Receiving Facility.",
      code: "DEMO-ORF-01",
      frequency: ReportFrequency.MONTHLY,
      defaultDepartment: "Distribusi Gas",
      active: true,
    },
    create: {
      id: "00000000-demo-0000-0000-000000000001",
      name: "[DEMO] Laporan Monitoring Tekanan & Penyaluran Gas ORF",
      description: "Data sintetis percontohan sistem pelaporan operasional harian & bulanan Onshore Receiving Facility.",
      code: "DEMO-ORF-01",
      frequency: ReportFrequency.MONTHLY,
      defaultDepartment: "Distribusi Gas",
      active: true,
    },
  });

  // 3. Upsert Demo Report Assignment
  const demoAssignment = await prisma.reportAssignment.upsert({
    where: { id: "00000000-demo-0000-0000-000000000002" },
    update: {
      reportId: demoReport.id,
      userId,
      picId,
      reviewerId,
      targetFinal: "2",
      targetSubmit: "5",
      meetingDate: "12",
      active: true,
    },
    create: {
      id: "00000000-demo-0000-0000-000000000002",
      reportId: demoReport.id,
      userId,
      picId,
      reviewerId,
      targetFinal: "2",
      targetSubmit: "5",
      meetingDate: "12",
      active: true,
    },
  });

  // 4. Create multi-status connected periods for the demo assignment
  const demoPeriods = [
    {
      id: "00000000-demo-0000-0000-000000000011",
      periodLabel: "[DEMO] Januari 2026",
      periodStart: new Date("2026-01-01T00:00:00Z"),
      periodEnd: new Date("2026-01-31T23:59:59Z"),
      deadlineSubmit: new Date("2026-01-05T17:00:00Z"),
      deadlineFinal: new Date("2026-01-02T17:00:00Z"),
      status: PeriodStatus.APPROVED,
    },
    {
      id: "00000000-demo-0000-0000-000000000012",
      periodLabel: "[DEMO] Februari 2026",
      periodStart: new Date("2026-02-01T00:00:00Z"),
      periodEnd: new Date("2026-02-28T23:59:59Z"),
      deadlineSubmit: new Date("2026-02-05T17:00:00Z"),
      deadlineFinal: new Date("2026-02-02T17:00:00Z"),
      status: PeriodStatus.REVISION,
    },
    {
      id: "00000000-demo-0000-0000-000000000013",
      periodLabel: "[DEMO] Maret 2026",
      periodStart: new Date("2026-03-01T00:00:00Z"),
      periodEnd: new Date("2026-03-31T23:59:59Z"),
      deadlineSubmit: new Date("2026-03-05T17:00:00Z"),
      deadlineFinal: new Date("2026-03-02T17:00:00Z"),
      status: PeriodStatus.UNDER_REVIEW,
    },
    {
      id: "00000000-demo-0000-0000-000000000014",
      periodLabel: "[DEMO] April 2026",
      periodStart: new Date("2026-04-01T00:00:00Z"),
      periodEnd: new Date("2026-04-30T23:59:59Z"),
      deadlineSubmit: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now (approaching deadline)
      deadlineFinal: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: PeriodStatus.IN_PROGRESS,
    },
    {
      id: "00000000-demo-0000-0000-000000000015",
      periodLabel: "[DEMO] Mei 2026",
      periodStart: new Date("2026-05-01T00:00:00Z"),
      periodEnd: new Date("2026-05-31T23:59:59Z"),
      deadlineSubmit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago (overdue)
      deadlineFinal: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      status: PeriodStatus.OVERDUE,
    },
    {
      id: "00000000-demo-0000-0000-000000000016",
      periodLabel: "[DEMO] Juni 2026",
      periodStart: new Date("2026-06-01T00:00:00Z"),
      periodEnd: new Date("2026-06-30T23:59:59Z"),
      deadlineSubmit: new Date("2026-06-05T17:00:00Z"),
      deadlineFinal: new Date("2026-06-02T17:00:00Z"),
      status: PeriodStatus.PENDING,
    },
  ];

  for (const p of demoPeriods) {
    await prisma.reportPeriod.upsert({
      where: { id: p.id },
      update: {
        assignmentId: demoAssignment.id,
        periodLabel: p.periodLabel,
        periodStart: p.periodStart,
        periodEnd: p.periodEnd,
        deadlineSubmit: p.deadlineSubmit,
        deadlineFinal: p.deadlineFinal,
        status: p.status,
      },
      create: {
        id: p.id,
        assignmentId: demoAssignment.id,
        periodLabel: p.periodLabel,
        periodStart: p.periodStart,
        periodEnd: p.periodEnd,
        deadlineSubmit: p.deadlineSubmit,
        deadlineFinal: p.deadlineFinal,
        status: p.status,
      },
    });
  }

  // 5. Connect Submissions for Jan, Feb, Mar
  // Jan: Approved submission
  await prisma.submission.upsert({
    where: { id: "00000000-demo-0000-0000-000000000021" },
    update: {
      status: SubmissionStatus.APPROVED,
      reviewedById: reviewerId,
      reviewedAt: new Date("2026-01-10T14:30:00Z"),
      reviewNotes: "[DEMO] Dokumen rekonsiliasi volume gas lengkap dan terverifikasi sesuai standar operasi.",
    },
    create: {
      id: "00000000-demo-0000-0000-000000000021",
      reportPeriodId: "00000000-demo-0000-0000-000000000011",
      submittedById: userId,
      status: SubmissionStatus.APPROVED,
      version: 1,
      fileName: "DEMO_Laporan_Penyaluran_Gas_Januari_2026.xlsx",
      notes: "[DEMO] Dokumen final rekonsiliasi periode Januari 2026.",
      reviewedById: reviewerId,
      reviewedAt: new Date("2026-01-10T14:30:00Z"),
      reviewNotes: "[DEMO] Dokumen rekonsiliasi volume gas lengkap dan terverifikasi sesuai standar operasi.",
    },
  });

  // Feb: Revision submission
  await prisma.submission.upsert({
    where: { id: "00000000-demo-0000-0000-000000000022" },
    update: {
      status: SubmissionStatus.REVISION,
      reviewedById: picId,
      reviewedAt: new Date("2026-02-07T10:15:00Z"),
      reviewNotes: "[DEMO] Mohon perbaiki data flow rate kompresor pada sheet 2 dan lampirkan berita acara.",
    },
    create: {
      id: "00000000-demo-0000-0000-000000000022",
      reportPeriodId: "00000000-demo-0000-0000-000000000012",
      submittedById: userId,
      status: SubmissionStatus.REVISION,
      version: 1,
      fileName: "DEMO_Draft_Penyaluran_Gas_Februari_2026.xlsx",
      notes: "[DEMO] Draft awal laporan Februari.",
      reviewedById: picId,
      reviewedAt: new Date("2026-02-07T10:15:00Z"),
      reviewNotes: "[DEMO] Mohon perbaiki data flow rate kompresor pada sheet 2 dan lampirkan berita acara.",
    },
  });

  // Mar: Under review submission
  await prisma.submission.upsert({
    where: { id: "00000000-demo-0000-0000-000000000023" },
    update: {
      status: SubmissionStatus.UNDER_REVIEW,
    },
    create: {
      id: "00000000-demo-0000-0000-000000000023",
      reportPeriodId: "00000000-demo-0000-0000-000000000013",
      submittedById: userId,
      status: SubmissionStatus.UNDER_REVIEW,
      version: 1,
      fileName: "DEMO_Laporan_Penyaluran_Gas_Maret_2026.xlsx",
      notes: "[DEMO] Sudah direkonsiliasi bersama tim lapangan ORF.",
    },
  });

  // 6. Connect Notifications for Demo Users
  const demoNotifications = [
    {
      id: "00000000-demo-0000-0000-000000000031",
      userId,
      reportPeriodId: "00000000-demo-0000-0000-000000000012",
      type: NotificationType.REVISION,
      title: "[DEMO] Permintaan Revisi: Periode Februari 2026",
      message: "PIC meminta perbaikan pada data flow rate kompresor sheet 2.",
      read: false,
    },
    {
      id: "00000000-demo-0000-0000-000000000032",
      userId: picId,
      reportPeriodId: "00000000-demo-0000-0000-000000000013",
      type: NotificationType.SUBMITTED,
      title: "[DEMO] Submission Baru: Periode Maret 2026",
      message: "Operator telah mengunggah berkas laporan untuk ditinjau.",
      read: false,
    },
    {
      id: "00000000-demo-0000-0000-000000000033",
      userId,
      reportPeriodId: "00000000-demo-0000-0000-000000000015",
      type: NotificationType.OVERDUE,
      title: "[DEMO] Peringatan Overdue: Periode Mei 2026",
      message: "Laporan telah melewati batas waktu cut-off operasional.",
      read: false,
    },
    {
      id: "00000000-demo-0000-0000-000000000034",
      userId: managementId,
      reportPeriodId: "00000000-demo-0000-0000-000000000011",
      type: NotificationType.APPROVED,
      title: "[DEMO] Laporan Disetujui: Periode Januari 2026",
      message: "Reviewer telah menerbitkan persetujuan resmi.",
      read: true,
    },
  ];

  for (const notif of demoNotifications) {
    await prisma.notification.upsert({
      where: { id: notif.id },
      update: {
        read: notif.read,
        message: notif.message,
      },
      create: notif,
    });
  }

  // 7. Activity Logs
  await prisma.activityLog.create({
    data: {
      userId: adminId,
      action: "DEMO_SYSTEM_INITIALIZED",
      entityType: "USER",
      entityId: adminId,
      metadata: {
        note: "Lingkungan demo terisi secara aman tanpa mengubah data produksi.",
      },
    },
  });

  console.log("✅ Demo accounts and operational mock data are successfully ready!");
}

async function main() {
  await seedDemoAccounts();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error("❌ Failed to seed demo accounts:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
