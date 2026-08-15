"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import { getAllHomepageSections, createHomepageSection, updateHomepageSection } from "@/lib/data/homepage";
import { isDemoMode } from "@/lib/demo-mode";

export interface CouvertureActionResult {
  success: boolean;
  error?: string;
}

const bottleIdsSchema = z.array(z.string().uuid()).max(7);

/**
 * Persists the hero bottle carousel (up to 7 product ids, in display
 * order) onto the HERO homepage_sections row. Creates the row if it
 * doesn't exist yet (fresh install). Publishing updates the public
 * homepage immediately via revalidatePath.
 */
export async function updateHeroBottlesAction(
  bottleIds: string[],
): Promise<CouvertureActionResult> {
  const session = await requireAdminPermission("marketing.content");

  if (isDemoMode()) {
    return { success: false, error: "demo_mode_read_only" };
  }

  try {
    const parsed = bottleIdsSchema.parse(bottleIds);
    const sections = await getAllHomepageSections();
    const hero = sections.find((s) => s.section_type === "HERO");

    if (hero) {
      await updateHomepageSection(hero.id, {
        config: { ...hero.config, bottle_ids: parsed },
      });
    } else {
      await createHomepageSection("HERO", 0, { bottle_ids: parsed });
    }

    await logAudit({
      actor: session.userId,
      action: "homepage_section_edited",
      entityType: "homepage_section",
      entityId: hero?.id ?? "hero",
      metadata: { bottle_ids: parsed },
    });

    revalidatePath("/");
    revalidatePath("/admin/couvertures");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "update_failed" };
  }
}
