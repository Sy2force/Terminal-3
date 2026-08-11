"use server";

import { revalidatePath } from "next/cache";
import { requireAdminPermission } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import {
  updateHomepageSection,
  createHomepageSection,
  deleteHomepageSection,
} from "@/lib/data/homepage";
import type { HomepageSectionType } from "@/types/database";

export interface HomepageActionResult {
  success: boolean;
  error?: string;
}

export async function toggleHomepageSectionAction(
  id: string,
  isEnabled: boolean,
): Promise<HomepageActionResult> {
  const session = await requireAdminPermission("marketing.content");
  try {
    await updateHomepageSection(id, { is_enabled: isEnabled });
    await logAudit({
      actor: session.userId,
      action: "homepage_section_toggled",
      entityType: "homepage_section",
      entityId: id,
      metadata: { is_enabled: isEnabled },
    });
    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "update_failed" };
  }
}

export async function reorderHomepageSectionAction(
  id: string,
  newOrder: number,
): Promise<HomepageActionResult> {
  await requireAdminPermission("marketing.content");
  try {
    await updateHomepageSection(id, { sort_order: newOrder });
    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "reorder_failed" };
  }
}

export async function updateHomepageSectionConfigAction(
  id: string,
  config: Record<string, unknown>,
): Promise<HomepageActionResult> {
  const session = await requireAdminPermission("marketing.content");
  try {
    await updateHomepageSection(id, { config });
    await logAudit({
      actor: session.userId,
      action: "homepage_section_edited",
      entityType: "homepage_section",
      entityId: id,
      metadata: { config_keys: Object.keys(config) },
    });
    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "update_failed" };
  }
}

export async function addHomepageSectionAction(
  sectionType: HomepageSectionType,
  sortOrder: number,
  config: Record<string, unknown> = {},
): Promise<HomepageActionResult> {
  const session = await requireAdminPermission("marketing.content");
  try {
    const section = await createHomepageSection(sectionType, sortOrder, config);
    await logAudit({
      actor: session.userId,
      action: "homepage_section_created",
      entityType: "homepage_section",
      entityId: section.id,
      metadata: { section_type: sectionType },
    });
    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "create_failed" };
  }
}

export async function deleteHomepageSectionAction(
  id: string,
): Promise<HomepageActionResult> {
  const session = await requireAdminPermission("marketing.content");
  try {
    await deleteHomepageSection(id);
    await logAudit({
      actor: session.userId,
      action: "homepage_section_deleted",
      entityType: "homepage_section",
      entityId: id,
    });
    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "delete_failed" };
  }
}
