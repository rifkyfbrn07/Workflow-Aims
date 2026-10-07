import { prisma } from "@/lib/prisma";

export interface LogActivityParams {
  userId?: string | null;
  action: string;
  entityType: "REPORT" | "ASSIGNMENT" | "PERIOD" | "SUBMISSION" | "USER" | "SYSTEM";
  entityId: string;
  metadata?: Record<string, any>;
}

export async function logActivity(params: LogActivityParams) {
  try {
    return await prisma.activityLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata || {},
      },
    });
  } catch (error) {
    console.error("Failed to write activity log:", error);
    return null;
  }
}

export async function getActivityLogs(options?: {
  limit?: number;
  entityType?: string;
  userId?: string;
}) {
  const limit = options?.limit || 50;
  const where: Record<string, any> = {};

  if (options?.entityType) where.entityType = options.entityType;
  if (options?.userId) where.userId = options.userId;

  return prisma.activityLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
}
