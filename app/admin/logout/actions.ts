"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOutAdmin(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "global" });
  redirect("/admin/login");
}
