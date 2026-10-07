/**
 * Development-only test accounts.
 *
 * This script is deliberately idempotent and does not delete, truncate, or
 * reset any data. Run it only after the target database and its schema have
 * been explicitly approved for development/test seeding.
 */
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const accounts = [
  { name: "Test Administrator", email: "admin@test.local", password: "Admin123!", role: UserRole.ADMIN },
  { name: "Test Manager", email: "manager@test.local", password: "Manager123!", role: UserRole.MANAGEMENT },
  { name: "Test Operator", email: "operator@test.local", password: "Operator123!", role: UserRole.USER },
];

async function main() {
  for (const account of accounts) {
    const passwordHash = await bcrypt.hash(account.password, 12);
    await prisma.user.upsert({
      where: { email: account.email },
      update: { name: account.name, passwordHash, role: account.role, active: true },
      create: { name: account.name, email: account.email, passwordHash, role: account.role, active: true },
    });
  }
  console.log("Development test accounts are ready.");
}

main()
  .catch((error) => {
    console.error("Unable to create development test accounts.", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
