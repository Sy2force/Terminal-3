import { requireAdminPermission } from "@/lib/admin/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { LeadsBoard, type LeadRow } from "@/components/admin/leads-board";

export default async function AdminLeadsPage() {
  await requireAdminPermission("customers.view");
  const supabase = createServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- leads not yet in generated Database type
  const db = supabase as any;

  const { data } = await db.from("leads").select("*").order("created_at", { ascending: false }).limit(300);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leads: LeadRow[] = ((data ?? []) as any[]).map((l) => ({
    id: l.id,
    name: l.name,
    phone: l.phone,
    email: l.email,
    source: l.source,
    status: l.status,
    interest: l.interest,
    createdAt: l.created_at,
    convertedUserId: l.converted_user_id,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-ivory">Leads</h1>
        <p className="mt-1 text-sm text-muted-grey">{leads.length} lead{leads.length > 1 ? "s" : ""}</p>
      </div>

      <LeadsBoard initialLeads={leads} />
    </div>
  );
}
