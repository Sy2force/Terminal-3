"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/admin/audit";
import { signAdminCookie } from "@/lib/admin/admin-cookie";
import { timingSafeEqual } from "crypto";

export async function logAdminLogin(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await logAudit({
    actor: user.id,
    action: "login",
    entityType: "staff_role",
    metadata: { email: user.email },
  });
}

export async function loginWithAdminPassword(formData: FormData): Promise<void> {
  const expected = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  const password = formData.get("password");

  if (!expected || !secret || typeof password !== "string" || !password.trim()) {
    redirect("/admin/login?error=Identifiants+invalides");
  }

  const expectedBuf = Buffer.from(expected);
  const providedBuf = Buffer.from(password);

  if (expectedBuf.length !== providedBuf.length) {
    redirect("/admin/login?error=Mot+de+passe+incorrect");
  }

  const ok = timingSafeEqual(expectedBuf, providedBuf);
  if (!ok) {
    redirect("/admin/login?error=Mot+de+passe+incorrect");
  }

  const token = await signAdminCookie("admin", "OWNER", secret);

  (await cookies()).set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  try {
    await logAudit({
      actor: "admin",
      action: "login",
      entityType: "staff_role",
      metadata: { method: "password_only" },
    });
  } catch {
    // Audit failure must not block the login.
  }

  redirect("/admin");
}
