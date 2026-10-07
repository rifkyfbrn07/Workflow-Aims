import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { hashPassword } from "@/lib/auth";
import { logActivity } from "./activity-service";

export interface CreateUserInput {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department?: string;
  adminId?: string;
}

export async function createUser(input: CreateUserInput) {
  const passwordHash = await hashPassword(input.password || "password123");

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase().trim(),
      passwordHash,
      role: input.role,
      department: input.department,
    },
  });

  await logActivity({
    userId: input.adminId,
    action: "USER_CREATED",
    entityType: "USER",
    entityId: user.id,
    metadata: { name: user.name, email: user.email, role: user.role },
  });

  return user;
}

export async function updateUser(id: string, data: Partial<CreateUserInput> & { active?: boolean }) {
  const updateData: Record<string, any> = {};
  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email.toLowerCase().trim();
  if (data.role) updateData.role = data.role;
  if (data.department !== undefined) updateData.department = data.department;
  if (data.active !== undefined) updateData.active = data.active;
  if (data.password) {
    updateData.passwordHash = await hashPassword(data.password);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  await logActivity({
    userId: data.adminId,
    action: "USER_UPDATED",
    entityType: "USER",
    entityId: user.id,
    metadata: { name: user.name, role: user.role },
  });

  return user;
}

export async function getAllUsers(role?: UserRole, search?: string) {
  const where: Record<string, any> = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { department: { contains: search, mode: "insensitive" } },
    ];
  }

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      active: true,
      createdAt: true,
      _count: {
        select: {
          assignedReports: true,
          picReports: true,
          reviewerReports: true,
          submissions: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });
}
