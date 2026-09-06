import { requireAdmin } from "@/lib/admin/auth";
import { listAdminUsers } from "@/app/admin/roles/actions";
import { RolesManager } from "@/components/admin/roles-manager";

export default async function AdminRolesPage() {
  const session = await requireAdmin();
  const users = await listAdminUsers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-noir-profond">Rôles et permissions</h1>
        <p className="mt-1 text-sm text-gris-chaud">
          {session.role === "OWNER"
            ? "Vous pouvez attribuer ou retirer un rôle à tout membre de l'équipe."
            : "Seul le propriétaire peut modifier les rôles."}
        </p>
      </div>

      <RolesManager initialUsers={users} isOwner={session.role === "OWNER"} />
    </div>
  );
}
