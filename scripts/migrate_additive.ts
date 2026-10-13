import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Applying additive migration to report_periods table...");
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "report_periods" ADD COLUMN IF NOT EXISTS "planDate" TEXT;
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "report_periods" ADD COLUMN IF NOT EXISTS "actualDate" TEXT;
  `);
  console.log("Additive columns added successfully if not present!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
