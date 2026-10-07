import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth";

/** Server-side scope check shared by archive, download and review endpoints. */
export async function canAccessSubmission(user: SessionUser, submissionId: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { reportPeriod: { include: { assignment: true } } },
  });
  if (!submission) return { allowed: false, submission: null };
  if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGEMENT) return { allowed: true, submission };

  const assignment = submission.reportPeriod.assignment;
  const allowed = user.role === UserRole.USER
    ? submission.submittedById === user.id || assignment.userId === user.id
    : user.role === UserRole.PIC
      ? assignment.picId === user.id
      : user.role === UserRole.REVIEWER
        ? assignment.reviewerId === user.id
        : false;
  return { allowed, submission };
}

export function scopeWhere(user: SessionUser) {
  if (user.role === UserRole.ADMIN || user.role === UserRole.MANAGEMENT) return {};
  if (user.role === UserRole.USER) return { submittedById: user.id };
  if (user.role === UserRole.PIC) return { reportPeriod: { assignment: { picId: user.id } } };
  return { reportPeriod: { assignment: { reviewerId: user.id } } };
}
