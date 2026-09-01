"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function signOutAdmin(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "global" });
  } catch {
    // Ignore Supabase sign-out errors when using cookie-only admin login.
  }

  (await cookies()).set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  redirect("/admin/login");
}
