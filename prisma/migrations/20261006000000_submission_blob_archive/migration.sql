-- Baseline migration for the complete Prisma schema.
-- This repository previously contained only a follow-up Blob migration, which
-- referenced UserRole before the enum and base tables had been created.
-- Keep this migration non-destructive: it is intended for a new, empty schema.

CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER', 'PIC', 'REVIEWER', 'MANAGEMENT');
CREATE TYPE "ReportFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'CUSTOM');
CREATE TYPE "PeriodStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION', 'APPROVED', 'OVERDUE');
CREATE TYPE "SubmissionStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'REVISION', 'APPROVED', 'REJECTED');
CREATE TYPE "NotificationType" AS ENUM ('REMINDER', 'DEADLINE_SOON', 'DEADLINE_TODAY', 'OVERDUE', 'SUBMITTED', 'REVISION', 'APPROVED');

CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "department" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reports" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "code" TEXT,
  "frequency" "ReportFrequency" NOT NULL DEFAULT 'MONTHLY',
  "defaultDepartment" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "report_assignments" (
  "id" TEXT NOT NULL,
  "reportId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "picId" TEXT,
  "reviewerId" TEXT,
  "targetFinal" TEXT,
  "targetSubmit" TEXT,
  "meetingDate" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "report_assignments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "report_periods" (
  "id" TEXT NOT NULL,
  "assignmentId" TEXT NOT NULL,
  "periodLabel" TEXT NOT NULL,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "deadlineFinal" TIMESTAMP(3),
  "deadlineSubmit" TIMESTAMP(3) NOT NULL,
  "meetingDate" TIMESTAMP(3),
  "status" "PeriodStatus" NOT NULL DEFAULT 'PENDING',
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "report_periods_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "submissions" (
  "id" TEXT NOT NULL,
  "reportPeriodId" TEXT NOT NULL,
  "submittedById" TEXT NOT NULL,
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
  "version" INTEGER NOT NULL DEFAULT 1,
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT,
  "fileSize" INTEGER,
  "mimeType" TEXT,
  "blobUrl" TEXT,
  "blobPath" TEXT,
  "notes" TEXT,
  "reviewNotes" TEXT,
  "reviewedById" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "onedriveFileId" TEXT,
  "onedriveFolderId" TEXT,
  "onedriveUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notifications" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "reportPeriodId" TEXT,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "escalationLevel" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "activity_logs" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "report_periods_status_idx" ON "report_periods"("status");
CREATE INDEX "report_periods_deadlineSubmit_idx" ON "report_periods"("deadlineSubmit");
CREATE UNIQUE INDEX "report_periods_assignmentId_periodLabel_key" ON "report_periods"("assignmentId", "periodLabel");
CREATE INDEX "submissions_reportPeriodId_idx" ON "submissions"("reportPeriodId");
CREATE INDEX "submissions_submittedById_submittedAt_idx" ON "submissions"("submittedById", "submittedAt");
CREATE INDEX "submissions_status_submittedAt_idx" ON "submissions"("status", "submittedAt");
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");
CREATE INDEX "notifications_reportPeriodId_type_idx" ON "notifications"("reportPeriodId", "type");
CREATE INDEX "activity_logs_entityType_entityId_idx" ON "activity_logs"("entityType", "entityId");
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");

ALTER TABLE "report_assignments" ADD CONSTRAINT "report_assignments_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "report_assignments" ADD CONSTRAINT "report_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "report_assignments" ADD CONSTRAINT "report_assignments_picId_fkey" FOREIGN KEY ("picId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "report_assignments" ADD CONSTRAINT "report_assignments_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "report_periods" ADD CONSTRAINT "report_periods_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "report_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_reportPeriodId_fkey" FOREIGN KEY ("reportPeriodId") REFERENCES "report_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_reportPeriodId_fkey" FOREIGN KEY ("reportPeriodId") REFERENCES "report_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
