import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/admin/audit";

const ALLOWED_KEYS = [
  "DELIVERY_FEE_AGOROT",
  "STORE_ONLINE",
  "CLUB_WELCOME_DISCOUNT_PERCENT",
  "WEEKLY_PROMO_MESSAGE",
  "STORE_NAME",
  "STORE_PHONE",
  "STORE_WHATSAPP",
  "STORE_ADDRESS",
  "STORE_LATITUDE",
  "STORE_LONGITUDE",
  "INSTAGRAM_URL",
  "FACEBOOK_URL",
  "OPENING_HOURS",
  "LOGO_URL",
  "SALMON_GALLERY_IMAGES",
];

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { key, value } = body as { key: string; value: unknown };

    if (!key || !ALLOWED_KEYS.includes(key)) {
      return NextResponse.json({ error: "invalid_key" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        {
          key,
          value,
          updated_by: session.userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAudit({
      actor: session.userId,
      action: "settings_changed",
      entityType: "site_setting",
      entityId: key,
      metadata: { key },
    });

    revalidatePath("/");
    revalidatePath("/admin/store");
    revalidatePath("/admin");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
