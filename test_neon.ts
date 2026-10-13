import { PrismaClient } from "@prisma/client";

async function testConnection(url: string) {
  console.log("Testing connection to:", url.replace(/:[^:@]+@/, ":****@"));
  const prisma = new PrismaClient({
    datasources: {
      db: { url },
    },
  });
  try {
    const count = await prisma.user.count();
    console.log("Success! User count:", count);
    return true;
  } catch (err: any) {
    console.error("Failed with error:", err.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const currentUrl = process.env.DATABASE_URL || "";
  // Test 1: current URL
  await testConnection(currentUrl);

  // Test 2: without channel_binding
  const noChannelBinding = currentUrl.replace("&channel_binding=require", "");
  if (noChannelBinding !== currentUrl) {
    await testConnection(noChannelBinding);
  }

  // Test 3: direct connection without -pooler
  const directUrl = noChannelBinding.replace("-pooler", "");
  if (directUrl !== noChannelBinding) {
    await testConnection(directUrl);
  }
}

main().catch(console.error);
