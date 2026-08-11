import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BranchRow } from "@/types/database";
import { isDemoMode } from "@/lib/demo-mode";

/**
 * Terminal 3 currently operates a single active branch. If a second branch
 * is added later, this should be replaced with an explicit branch selector
 * in the checkout flow rather than an implicit "first active" pick.
 */
export async function getDefaultBranch(): Promise<BranchRow | null> {
  if (isDemoMode()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("branches")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}
