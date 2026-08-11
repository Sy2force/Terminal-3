import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

/**
 * Cron job endpoint to automatically update promotion statuses
 * Call this endpoint periodically (e.g., every 5 minutes) via a cron job
 * Example: curl -X POST https://your-domain.com/api/cron/promotions
 * 
 * To secure this endpoint, you should add authentication (e.g., a secret token)
 */
export async function POST(request: Request) {
  // Optional: Add authentication check
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceRoleClient();
    
    const { error } = await supabase.rpc("update_promotion_statuses");
    
    if (error) {
      console.error("Failed to update promotion statuses:", error);
      return NextResponse.json({ error: "Failed to update promotion statuses" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Promotion statuses updated" });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
