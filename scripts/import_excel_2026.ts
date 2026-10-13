import * as xlsx from "xlsx";
import * as path from "path";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { ReportFrequency, PeriodStatus, UserRole } from "@prisma/client";
import { calculateDeadlineDate } from "../src/services/deadline-service";
import { MONTH_NAMES } from "../src/lib/constants";

interface ReportItem {
  no: number;
  deskripsi: string;
  user: string;
  pic: string;
  reviewer: string;
  targetFinal: string | number;
  targetSubmit: string | number;
  tanggalMeeting: string | number | null;
  plans: (string | number | null)[];
  aktuals: (string | number | null)[];
}

async function ensureDbConnected() {
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      process.stdout.write(`Menghubungkan ke database Neon (percobaan ${attempt}/6)... `);
      await prisma.$queryRawUnsafe("SELECT 1;");
      console.log("✓ Terhubung!");
      return;
    } catch (err: any) {
      console.log(`Gagal (${err.message?.slice(0, 80)}...). Menunggu 4 detik...`);
      await new Promise((res) => setTimeout(res, 4000));
    }
  }
  throw new Error("Gagal terhubung ke database setelah 6 percobaan.");
}

async function main() {
  console.log("==========================================================");
  console.log("🚀 MEMULAI IMPORT JADWAL LAPORAN EXCEL 2026 (LAPORAN AIMM)");
  console.log("==========================================================");

  await ensureDbConnected();

  // 1. Baca Workbook Excel Asli
  const filePath = path.join(process.cwd(), "data/00 Draft_Jadwal_Laporan_Bulanan 2026 rev.xlsx");
  const wb = xlsx.readFile(filePath);
  const sheet = wb.Sheets["LAPORAN AIMM"];
  if (!sheet) {
    throw new Error("Sheet 'LAPORAN AIMM' tidak ditemukan dalam file Excel!");
  }

  const rawRows = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 });
  const reportsData: ReportItem[] = [];

  for (let i = 3; i < 40; i++) {
    const row = rawRows[i];
    if (!row || typeof row[0] !== "number" || row[0] < 1 || row[0] > 18) continue;

    const no = row[0];
    const deskripsi = String(row[1] || "").trim();
    const user = String(row[2] || "").trim();
    const pic = String(row[3] || "").trim();
    const reviewer = String(row[4] || "").trim();
    const targetFinal = row[5] !== undefined && row[5] !== null ? row[5] : "";
    const targetSubmit = row[6] !== undefined && row[6] !== null ? row[6] : "";
    const tanggalMeeting = row[7] !== undefined && row[7] !== null ? row[7] : null;

    const plans: (string | number | null)[] = [];
    for (let m = 9; m <= 20; m++) {
      const val = row[m];
      plans.push(val !== undefined && val !== null ? val : null);
    }

    const nextRow = rawRows[i + 1];
    const aktuals: (string | number | null)[] = [];
    if (nextRow && nextRow[8] === "Aktual") {
      for (let m = 9; m <= 20; m++) {
        const val = nextRow[m];
        aktuals.push(val !== undefined && val !== null ? val : null);
      }
    } else {
      for (let m = 0; m < 12; m++) aktuals.push(null);
    }

    reportsData.push({
      no,
      deskripsi,
      user,
      pic,
      reviewer,
      targetFinal,
      targetSubmit,
      tanggalMeeting,
      plans,
      aktuals,
    });
  }

  console.log(`✓ Berhasil memvalidasi ${reportsData.length} laporan dari sheet LAPORAN AIMM.`);
  if (reportsData.length !== 18) {
    throw new Error(`Jumlah laporan tidak sesuai! Ditemukan ${reportsData.length}, diharapkan 18.`);
  }

  // 2. Siapkan User Stakeholder & Departemen secara Idempotent
  console.log("\n--- Menyiapkan Akun Stakeholder & Departemen ---");
  const defaultPasswordHash = await bcrypt.hash("NusantaraRegas2026!", 10);

  const staffDefinitions = [
    // Person In Charge & Reviewer
    { name: "Hudan", email: "hudan@nusantararegas.com", role: UserRole.PIC, department: "SHG" },
    { name: "Ito", email: "ito@nusantararegas.com", role: UserRole.PIC, department: "SPBD" },
    { name: "Dimas", email: "dimas@nusantararegas.com", role: UserRole.PIC, department: "ManRisk" },
    { name: "Sidiq", email: "sidiq@nusantararegas.com", role: UserRole.PIC, department: "SPBD" },
    { name: "Herman", email: "herman@nusantararegas.com", role: UserRole.REVIEWER, department: "Management" },
    // Divisi Pemohon (USER)
    { name: "Divisi SHG", email: "shg@nusantararegas.com", role: UserRole.USER, department: "SHG" },
    { name: "Sekretariat Perusahaan (SEKPER)", email: "sekper@nusantararegas.com", role: UserRole.USER, department: "SEKPER" },
    { name: "Divisi SPBD", email: "spbd@nusantararegas.com", role: UserRole.USER, department: "SPBD" },
    { name: "PT Pertamina (Persero) Holding", email: "holding@nusantararegas.com", role: UserRole.USER, department: "Holding" },
    { name: "Divisi Manajemen Risiko (ManRisk)", email: "manrisk@nusantararegas.com", role: UserRole.USER, department: "ManRisk" },
    { name: "Divisi AIMM", email: "aimm@nusantararegas.com", role: UserRole.USER, department: "AIMM" },
    { name: "VP Engineering & Maintenance (VP E&M)", email: "vp.em@nusantararegas.com", role: UserRole.USER, department: "VP E&M" },
    { name: "Divisi Keuangan", email: "keuangan@nusantararegas.com", role: UserRole.USER, department: "Keuangan" },
    { name: "Divisi Engineering & Maintenance (E&M)", email: "em@nusantararegas.com", role: UserRole.USER, department: "E&M" },
  ];

  const userMap: Record<string, string> = {};

  for (const s of staffDefinitions) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        name: s.name,
        role: s.role,
        department: s.department,
        active: true,
      },
      create: {
        name: s.name,
        email: s.email,
        passwordHash: defaultPasswordHash,
        role: s.role,
        department: s.department,
        active: true,
      },
    });
    userMap[s.name.toLowerCase()] = user.id;
    userMap[s.email.toLowerCase()] = user.id;
    if (s.department) {
      userMap[s.department.toLowerCase()] = user.id;
    }
  }

  const findUserId = (key: string): string => {
    const k = key.toLowerCase().trim();
    if (userMap[k]) return userMap[k];
    if (k.includes("hudan")) return userMap["hudan@nusantararegas.com"];
    if (k.includes("ito")) return userMap["ito@nusantararegas.com"];
    if (k.includes("dimas")) return userMap["dimas@nusantararegas.com"];
    if (k.includes("sidiq")) return userMap["sidiq@nusantararegas.com"];
    if (k.includes("herman")) return userMap["herman@nusantararegas.com"];
    if (k.includes("shg")) return userMap["shg@nusantararegas.com"];
    if (k.includes("sekper")) return userMap["sekper@nusantararegas.com"];
    if (k.includes("spbd")) return userMap["spbd@nusantararegas.com"];
    if (k.includes("holding")) return userMap["holding@nusantararegas.com"];
    if (k.includes("manrisk")) return userMap["manrisk@nusantararegas.com"];
    if (k.includes("aimm")) return userMap["aimm@nusantararegas.com"];
    if (k.includes("vp e&m")) return userMap["vp.em@nusantararegas.com"];
    if (k.includes("keuangan")) return userMap["keuangan@nusantararegas.com"];
    if (k.includes("e&m")) return userMap["em@nusantararegas.com"];
    return userMap["spbd@nusantararegas.com"];
  };

  console.log("✓ Semua akun stakeholder dan departemen siap.");

  // 3. Import 18 Laporan, Assignment, dan Periode 2026
  console.log("\n--- Mengintegrasikan 18 Laporan Master & Periode 2026 ---");

  const year = 2026;
  let totalPeriodsCreated = 0;

  for (const item of reportsData) {
    const code = `RPT-2026-${String(item.no).padStart(2, "0")}`;

    // Tentukan frekuensi: kuartalan (14, 15, 16, 17) atau bulanan (lainnya)
    const isQuarterly = [14, 15, 16, 17].includes(item.no);
    const isActivo = [9, 10].includes(item.no);
    const frequency = isQuarterly ? ReportFrequency.QUARTERLY : ReportFrequency.MONTHLY;

    // A. Upsert Report
    let report = await prisma.report.findFirst({
      where: { code },
    });

    if (!report) {
      report = await prisma.report.create({
        data: {
          name: item.deskripsi,
          code,
          description: `Laporan operasional untuk ${item.user}. Target Final: tgl ${item.targetFinal || "-"}, Target Submit: tgl ${item.targetSubmit || "-"}.`,
          frequency,
          defaultDepartment: item.user,
          active: true,
        },
      });
    } else {
      report = await prisma.report.update({
        where: { id: report.id },
        data: {
          name: item.deskripsi,
          description: `Laporan operasional untuk ${item.user}. Target Final: tgl ${item.targetFinal || "-"}, Target Submit: tgl ${item.targetSubmit || "-"}.`,
          frequency,
          defaultDepartment: item.user,
          active: true,
        },
      });
    }

    // B. Upsert Assignment
    const userId = findUserId(item.user);
    const picId = findUserId(item.pic);
    const reviewerId = findUserId(item.reviewer);

    let assignment = await prisma.reportAssignment.findFirst({
      where: { reportId: report.id },
    });

    if (!assignment) {
      assignment = await prisma.reportAssignment.create({
        data: {
          reportId: report.id,
          userId,
          picId,
          reviewerId,
          targetFinal: String(item.targetFinal),
          targetSubmit: String(item.targetSubmit),
          meetingDate: item.tanggalMeeting !== null ? String(item.tanggalMeeting) : null,
          active: true,
        },
      });
    } else {
      assignment = await prisma.reportAssignment.update({
        where: { id: assignment.id },
        data: {
          userId,
          picId,
          reviewerId,
          targetFinal: String(item.targetFinal),
          targetSubmit: String(item.targetSubmit),
          meetingDate: item.tanggalMeeting !== null ? String(item.tanggalMeeting) : null,
          active: true,
        },
      });
    }

    // C. Generate Periode 2026
    if (isActivo) {
      // 2 Siklus per bulan untuk Activo Approvals (Tanggal 1-10 & Tanggal 11-Akhir Bulan)
      for (let mIdx = 0; mIdx < 12; mIdx++) {
        const daysInMonth = new Date(year, mIdx + 1, 0).getDate(); // 28 (Feb), 30, atau 31

        const rawPlan = item.plans[mIdx];
        const rawAktual = item.aktuals[mIdx];

        // Parsing aktual untuk 2 siklus jika ada (misal: "10 & 27", "10 & 31", "11 & 29", 12, 14)
        let actualCycle1: string | null = null;
        let actualCycle2: string | null = null;

        if (rawAktual !== null && rawAktual !== undefined) {
          const strAktual = String(rawAktual).trim();
          if (strAktual.includes("&")) {
            const parts = strAktual.split("&").map((s) => s.trim());
            actualCycle1 = parts[0] || null;
            actualCycle2 = parts[1] || null;
          } else {
            actualCycle1 = strAktual;
          }
        }

        // Siklus 1: Tanggal 1-10
        const labelCycle1 = `${MONTH_NAMES[mIdx]} ${year} (Siklus 1 - Tgl 1-10)`;
        const pStart1 = new Date(year, mIdx, 1, 0, 0, 0);
        const pEnd1 = new Date(year, mIdx, 10, 23, 59, 59);
        const deadlineSubmit1 = new Date(year, mIdx, 10, 17, 0, 0);
        const deadlineFinal1 = new Date(year, mIdx, 10, 17, 0, 0);

        await prisma.reportPeriod.upsert({
          where: {
            assignmentId_periodLabel: {
              assignmentId: assignment.id,
              periodLabel: labelCycle1,
            },
          },
          update: {
            periodStart: pStart1,
            periodEnd: pEnd1,
            deadlineSubmit: deadlineSubmit1,
            deadlineFinal: deadlineFinal1,
            planDate: "10",
            actualDate: actualCycle1,
          },
          create: {
            assignmentId: assignment.id,
            periodLabel: labelCycle1,
            periodStart: pStart1,
            periodEnd: pEnd1,
            deadlineSubmit: deadlineSubmit1,
            deadlineFinal: deadlineFinal1,
            planDate: "10",
            actualDate: actualCycle1,
            status: PeriodStatus.PENDING,
          },
        });
        totalPeriodsCreated++;

        // Siklus 2: Tanggal 11 - Akhir Bulan (28/30/31)
        const labelCycle2 = `${MONTH_NAMES[mIdx]} ${year} (Siklus 2 - Tgl 11-${daysInMonth})`;
        const pStart2 = new Date(year, mIdx, 11, 0, 0, 0);
        const pEnd2 = new Date(year, mIdx, daysInMonth, 23, 59, 59);
        const deadlineSubmit2 = new Date(year, mIdx, daysInMonth, 17, 0, 0);
        const deadlineFinal2 = new Date(year, mIdx, daysInMonth, 17, 0, 0);

        await prisma.reportPeriod.upsert({
          where: {
            assignmentId_periodLabel: {
              assignmentId: assignment.id,
              periodLabel: labelCycle2,
            },
          },
          update: {
            periodStart: pStart2,
            periodEnd: pEnd2,
            deadlineSubmit: deadlineSubmit2,
            deadlineFinal: deadlineFinal2,
            planDate: String(daysInMonth),
            actualDate: actualCycle2,
          },
          create: {
            assignmentId: assignment.id,
            periodLabel: labelCycle2,
            periodStart: pStart2,
            periodEnd: pEnd2,
            deadlineSubmit: deadlineSubmit2,
            deadlineFinal: deadlineFinal2,
            planDate: String(daysInMonth),
            actualDate: actualCycle2,
            status: PeriodStatus.PENDING,
          },
        });
        totalPeriodsCreated++;
      }
    } else if (isQuarterly) {
      // 4 Kuartal: Q1 (Mar), Q2 (Jun), Q3 (Sep), Q4 (Dec)
      const quarters = [
        { label: `Q1 ${year}`, startMonth: 0, endMonth: 2, planMonthIdx: 2 },
        { label: `Q2 ${year}`, startMonth: 3, endMonth: 5, planMonthIdx: 5 },
        { label: `Q3 ${year}`, startMonth: 6, endMonth: 8, planMonthIdx: 8 },
        { label: `Q4 ${year}`, startMonth: 9, endMonth: 11, planMonthIdx: 11 },
      ];

      for (const q of quarters) {
        const periodStart = new Date(year, q.startMonth, 1, 0, 0, 0);
        const periodEnd = new Date(year, q.endMonth + 1, 0, 23, 59, 59);
        const deadlineSubmit = calculateDeadlineDate(year, q.planMonthIdx, assignment.targetSubmit);
        const deadlineFinal = assignment.targetFinal
          ? calculateDeadlineDate(year, q.planMonthIdx, assignment.targetFinal)
          : null;

        let meetingDate: Date | null = null;
        if (assignment.meetingDate && assignment.meetingDate !== "N/A" && !isNaN(Number(assignment.meetingDate))) {
          meetingDate = calculateDeadlineDate(year, q.planMonthIdx, assignment.meetingDate);
        }

        const rawPlan = item.plans[q.planMonthIdx];
        const rawAktual = item.aktuals[q.planMonthIdx];

        await prisma.reportPeriod.upsert({
          where: {
            assignmentId_periodLabel: {
              assignmentId: assignment.id,
              periodLabel: q.label,
            },
          },
          update: {
            periodStart,
            periodEnd,
            deadlineSubmit,
            deadlineFinal,
            meetingDate,
            planDate: rawPlan !== null && rawPlan !== undefined ? String(rawPlan) : null,
            actualDate: rawAktual !== null && rawAktual !== undefined ? String(rawAktual) : null,
          },
          create: {
            assignmentId: assignment.id,
            periodLabel: q.label,
            periodStart,
            periodEnd,
            deadlineSubmit,
            deadlineFinal,
            meetingDate,
            planDate: rawPlan !== null && rawPlan !== undefined ? String(rawPlan) : null,
            actualDate: rawAktual !== null && rawAktual !== undefined ? String(rawAktual) : null,
            status: PeriodStatus.PENDING,
          },
        });
        totalPeriodsCreated++;
      }
    } else {
      // 12 Bulan Reguler
      for (let mIdx = 0; mIdx < 12; mIdx++) {
        const monthLabel = `${MONTH_NAMES[mIdx]} ${year}`;
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

        const rawPlan = item.plans[mIdx];
        const rawAktual = item.aktuals[mIdx];

        await prisma.reportPeriod.upsert({
          where: {
            assignmentId_periodLabel: {
              assignmentId: assignment.id,
              periodLabel: monthLabel,
            },
          },
          update: {
            periodStart,
            periodEnd,
            deadlineSubmit,
            deadlineFinal,
            meetingDate,
            planDate: rawPlan !== null && rawPlan !== undefined ? String(rawPlan) : null,
            actualDate: rawAktual !== null && rawAktual !== undefined ? String(rawAktual) : null,
          },
          create: {
            assignmentId: assignment.id,
            periodLabel: monthLabel,
            periodStart,
            periodEnd,
            deadlineSubmit,
            deadlineFinal,
            meetingDate,
            planDate: rawPlan !== null && rawPlan !== undefined ? String(rawPlan) : null,
            actualDate: rawAktual !== null && rawAktual !== undefined ? String(rawAktual) : null,
            status: PeriodStatus.PENDING,
          },
        });
        totalPeriodsCreated++;
      }
    }

    console.log(`  ✓ [${code}] "${item.deskripsi}" (${frequency}) berhasil dipetakan.`);
  }

  console.log("\n==========================================================");
  console.log(`🎉 SUKSES! Total 18 laporan master dan ${totalPeriodsCreated} periode 2026 terintegrasi!`);
  console.log("==========================================================");
}

main()
  .catch((err) => {
    console.error("❌ Terjadi kesalahan saat mengimpor jadwal Excel:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
