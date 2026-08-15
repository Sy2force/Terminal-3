import { requireAdminPermission } from "@/lib/admin/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { DiscountsManager, type DiscountRuleRow } from "@/components/admin/discounts-manager";

export default async function AdminDiscountsPage() {
  await requireAdminPermission("discounts.manage");
  const supabase = createServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- discount_rules not yet in generated Database type
  const db = supabase as any;

  const { data } = await db.from("discount_rules").select("*").order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rules: DiscountRuleRow[] = ((data ?? []) as any[]).map((r) => ({
    id: r.id,
    code: r.code,
    nameFr: r.name_fr,
    discountType: r.discount_type,
    discountValue: Number(r.discount_value),
    minOrderAgorot: r.min_order_agorot,
    isActive: r.is_active,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-ivory">Remises</h1>
        <p className="mt-1 text-sm text-muted-grey">
          Toutes les remises sont recalculées côté serveur au moment de la commande — jamais
          confiées au navigateur.
        </p>
      </div>

      <DiscountsManager initialRules={rules} />
    </div>
  );
}
