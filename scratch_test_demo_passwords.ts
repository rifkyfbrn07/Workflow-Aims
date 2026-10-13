import { prisma } from "./src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const demoUsers = await prisma.user.findMany({
    where: { email: { startsWith: "demo." } },
    select: { email: true, role: true, passwordHash: true },
  });

  console.log(`Found ${demoUsers.length} demo users:`);
  for (const u of demoUsers) {
    const isMatch = await bcrypt.compare("DemoRegas2026!", u.passwordHash);
    console.log(`  - [${u.role}] ${u.email}: password valid = ${isMatch}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
