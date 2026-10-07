-- Blob metadata stays in PostgreSQL while file binaries remain in object storage.
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'MANAGEMENT';

ALTER TABLE "submissions"
  ADD COLUMN IF NOT EXISTS "fileSize" INTEGER,
  ADD COLUMN IF NOT EXISTS "mimeType" TEXT,
  ADD COLUMN IF NOT EXISTS "blobUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "blobPath" TEXT;

CREATE INDEX IF NOT EXISTS "submissions_submittedById_submittedAt_idx" ON "submissions"("submittedById", "submittedAt");
CREATE INDEX IF NOT EXISTS "submissions_status_submittedAt_idx" ON "submissions"("status", "submittedAt");
CREATE INDEX IF NOT EXISTS "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");
