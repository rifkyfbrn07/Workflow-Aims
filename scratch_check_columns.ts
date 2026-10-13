import { prisma } from "./src/lib/prisma";

async function main() {
  const tables = ['reports', 'report_assignments', 'report_periods', 'users'];
  for (const table of tables) {
    const result = await prisma.$queryRawUnsafe<any[]>(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = '${table}';
    `);
    console.log(`Columns of ${table}:`, result.map(r => `${r.column_name} (${r.data_type})`));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
