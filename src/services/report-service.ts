import { prisma } from "@/lib/prisma";
import { ReportFrequency } from "@prisma/client";
import { logActivity } from "./activity-service";

export interface CreateReportInput {
  name: string;
  description?: string;
  code?: string;
  frequency: ReportFrequency;
  defaultDepartment?: string;
  userId?: string; // current admin user
}

export async function createReport(input: CreateReportInput) {
  const report = await prisma.report.create({
    data: {
      name: input.name,
      description: input.description,
      code: input.code,
      frequency: input.frequency,
      defaultDepartment: input.defaultDepartment,
    },
  });

  await logActivity({
    userId: input.userId,
    action: "REPORT_CREATED",
    entityType: "REPORT",
    entityId: report.id,
    metadata: {
      name: report.name,
      frequency: report.frequency,
    },
  });

  return report;
}

export async function updateReport(id: string, data: Partial<CreateReportInput>) {
  const report = await prisma.report.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      code: data.code,
      frequency: data.frequency,
      defaultDepartment: data.defaultDepartment,
    },
  });

  await logActivity({
    userId: data.userId,
    action: "REPORT_UPDATED",
    entityType: "REPORT",
    entityId: report.id,
    metadata: { name: report.name },
  });

  return report;
}

export async function deleteReport(id: string, userId?: string) {
  const report = await prisma.report.delete({
    where: { id },
  });

  await logActivity({
    userId,
    action: "REPORT_DELETED",
    entityType: "REPORT",
    entityId: id,
    metadata: { name: report.name },
  });

  return report;
}

export async function getAllReports(search?: string) {
  const where: Record<string, any> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { defaultDepartment: { contains: search, mode: "insensitive" } },
    ];
  }

  return prisma.report.findMany({
    where,
    include: {
      assignments: {
        include: {
          user: true,
          pic: true,
          reviewer: true,
          _count: {
            select: { periods: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
