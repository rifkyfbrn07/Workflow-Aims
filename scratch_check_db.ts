import { prisma } from "./src/lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, department: true },
  });
  console.log("Users:", JSON.stringify(users, null, 2));

  const reports = await prisma.report.findMany({
    include: {
      assignments: {
        include: {
          user: { select: { name: true } },
          pic: { select: { name: true } },
          reviewer: { select: { name: true } },
          periods: { select: { id: true, periodLabel: true, deadlineSubmit: true, status: true } },
        },
      },
    },
  });
  console.log("Reports count:", reports.length);
  for (const r of reports) {
    console.log(`- [${r.code || "NO_CODE"}] ${r.name} (${r.frequency}): assignments=${r.assignments.length}`);
    for (const a of r.assignments) {
      console.log(`    User: ${a.user?.name}, PIC: ${a.pic?.name}, Reviewer: ${a.reviewer?.name}, Periods: ${a.periods.length}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
