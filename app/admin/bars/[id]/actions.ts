"use server";

import { revalidatePath } from "next/cache";
import { requireAdminPermission } from "@/lib/admin/auth";
import { adminSetBarStatus } from "@/lib/data/bar-profiles";
import type { BarStatus } from "@/types/database";

const ALLOWED: BarStatus[] = ["new", "contacted", "qualified", "approved", "inactive"];

export async function updateBarStatusAction(
  barProfileId: string,
  newStatus: BarStatus,
): Promise<{ success: boolean; error?: string }> {
  const session = await requireAdminPermission("customers.edit");

  if (!ALLOWED.includes(newStatus)) {
    return { success: false, error: "Statut invalide." };
  }
  const result = await adminSetBarStatus(barProfileId, newStatus, session.userId);
  if (!result.success) return result;

  revalidatePath("/admin/bars");
  revalidatePath(`/admin/bars/${barProfileId}`);
  return { success: true };
}
