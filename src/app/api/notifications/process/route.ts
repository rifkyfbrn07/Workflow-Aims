import { NextResponse } from "next/server";
import { generateDeadlineNotifications } from "@/services/notification-service";
import { syncPeriodStatuses } from "@/services/deadline-service";

export async function GET() {
  try {
    // 1. Sync overdue statuses based on current date
    const syncResult = await syncPeriodStatuses();

    // 2. Generate reminders (H-3, H-1, Hari H, Overdue) and escalations
    const notifResult = await generateDeadlineNotifications();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      periodsStatusUpdated: syncResult.updatedCount,
      notificationsCreated: notifResult.createdCount,
      details: notifResult.details,
    });
  } catch (error: any) {
    console.error("Reminder engine error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process notifications" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
