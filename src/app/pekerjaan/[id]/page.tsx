import React from "react";
import { notFound } from "next/navigation";
import { getPeriodById } from "@/services/period-service";
import { getCurrentUser } from "@/lib/auth";
import { PekerjaanDetailClient } from "@/components/features/PekerjaanDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function PekerjaanDetailPage({ params }: PageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  const period = await getPeriodById(id);

  if (!period) {
    notFound();
  }

  return (
    <PekerjaanDetailClient
      period={period as any}
      currentUserId={currentUser?.id}
      currentUserRole={currentUser?.role}
    />
  );
}
