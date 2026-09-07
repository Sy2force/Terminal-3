import { requireAdminPermission } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { MembersList } from "@/components/admin/members-list";

export default async function AdminMembersPage() {
  await requireAdminPermission("customers.view");

  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("club_memberships")
    .select(`
      *,
      profile:profiles(id, first_name, last_name, email, phone, created_at),
      tier:membership_tiers(id, name, slug)
    `)
    .order("joined_at", { ascending: false });

  const { data: tiers } = await supabase
    .from("membership_tiers")
    .select("*")
    .order("display_order", { ascending: true });

  const { count: totalCount } = await supabase
    .from("club_memberships")
    .select("*", { count: "exact", head: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-noir-profond">Membres du Club</h1>
        <p className="mt-1 text-sm text-gris-chaud">
          {totalCount ?? 0} membre{totalCount !== 1 ? "s" : ""} inscrit{totalCount !== 1 ? "s" : ""}
        </p>
      </div>

      <MembersList
        memberships={memberships ?? []}
        tiers={tiers ?? []}
      />
    </div>
  );
}
