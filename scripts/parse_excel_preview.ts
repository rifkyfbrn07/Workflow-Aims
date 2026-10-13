import * as xlsx from "xlsx";
import * as path from "path";

const filePath = path.join(process.cwd(), "data/00 Draft_Jadwal_Laporan_Bulanan 2026 rev.xlsx");
const wb = xlsx.readFile(filePath);
const sheet = wb.Sheets["LAPORAN AIMM"];
const rawRows = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 });

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

const reports: ReportItem[] = [];

// Rows start at index 3 (Row 4 in Excel)
for (let i = 3; i < rawRows.length; i++) {
  const row = rawRows[i];
  if (!row || typeof row[0] !== "number") continue;

  const no = row[0];
  const deskripsi = String(row[1] || "").trim();
  const user = String(row[2] || "").trim();
  const pic = String(row[3] || "").trim();
  const reviewer = String(row[4] || "").trim();
  const targetFinal = row[5] !== undefined && row[5] !== null ? row[5] : "";
  const targetSubmit = row[6] !== undefined && row[6] !== null ? row[6] : "";
  const tanggalMeeting = row[7] !== undefined && row[7] !== null ? row[7] : null;

  // Plan row (columns 9 to 20)
  const plans = [];
  for (let m = 9; m <= 20; m++) {
    plans.push(row[m] !== undefined ? row[m] : null);
  }

  // Next row is Aktual
  const nextRow = rawRows[i + 1];
  const aktuals = [];
  if (nextRow && nextRow[8] === "Aktual") {
    for (let m = 9; m <= 20; m++) {
      aktuals.push(nextRow[m] !== undefined ? nextRow[m] : null);
    }
  } else {
    for (let m = 0; m < 12; m++) aktuals.push(null);
  }

  reports.push({
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

console.log(`Parsed ${reports.length} reports.`);
for (const r of reports) {
  console.log(`\nReport #${r.no}: "${r.deskripsi}"`);
  console.log(`  User: ${r.user} | PIC: ${r.pic} | Reviewer: ${r.reviewer}`);
  console.log(`  Target Final: ${r.targetFinal} | Target Submit: ${r.targetSubmit} | Meeting: ${r.tanggalMeeting}`);
  console.log(`  Plans:`, r.plans);
  console.log(`  Aktuals:`, r.aktuals);
}
