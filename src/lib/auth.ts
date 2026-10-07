import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { UserRole } from "@prisma/client";

const AUTH_COOKIE_NAME = "worktrack_session";
const JWT_SECRET = process.env.AUTH_SECRET || "worktrack-super-secret-key-2026-production-ready";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionUser;
    return decoded;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    // Verify user is still active in DB
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        active: true,
      },
    });

    if (!user || !user.active) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    };
  } catch {
    return null;
  }
}

export async function setAuthCookie(user: SessionUser) {
  const token = signToken(user);
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  if (userRole === "ADMIN") return true;
  return requiredRoles.includes(userRole);
}
