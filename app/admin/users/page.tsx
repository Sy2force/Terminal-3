import { requireAdminPermission } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { Shield, UserPlus, Trash2 } from "lucide-react";
import { formatAgorot } from "@/lib/money";

export default async function AdminUsersPage() {
  await requireAdminPermission("admin.users");
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select(`
      *,
      admin_roles (
        role
      )
    `)
    .order("created_at", { ascending: false });

  const { data: roles } = await supabase
    .from("admin_roles")
    .select(`
      *,
      profiles (
        first_name,
        last_name,
        email
      )
    `);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ivory">Utilisateurs admin</h1>
          <p className="mt-1 text-sm text-muted-grey">
            Gestion des rôles et permissions
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Users without admin roles */}
        <div className="rounded-sm border border-white/5 bg-graphite/30 p-5">
          <h2 className="font-serif text-lg text-champagne mb-4">Utilisateurs</h2>
          <div className="space-y-3">
            {users?.map((user: any) => (
              <UserRow key={user.id} user={user} />
            ))}
            {users?.length === 0 && (
              <p className="text-sm text-muted-grey">Aucun utilisateur.</p>
            )}
          </div>
        </div>

        {/* Admin roles */}
        <div className="rounded-sm border border-white/5 bg-graphite/30 p-5">
          <h2 className="font-serif text-lg text-champagne mb-4">Rôles admin</h2>
          <div className="space-y-3">
            {roles?.map((role: any) => (
              <RoleRow key={role.id} role={role} />
            ))}
            {roles?.length === 0 && (
              <p className="text-sm text-muted-grey">Aucun rôle assigné.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserRow({ user }: { user: any }) {
  const hasRole = user.admin_roles && user.admin_roles.length > 0;
  
  return (
    <div className="flex items-center justify-between rounded-sm border border-white/5 bg-white/5 p-3">
      <div>
        <div className="font-medium text-ivory">
          {user.first_name || user.last_name 
            ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
            : "Utilisateur"}
        </div>
        <div className="text-xs text-muted-grey">{user.email || "—"}</div>
      </div>
      {hasRole ? (
        <span className="rounded-full border border-champagne/30 px-2 py-1 text-xs text-champagne">
          {user.admin_roles[0].role}
        </span>
      ) : (
        <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-muted-grey">
          Aucun rôle
        </span>
      )}
    </div>
  );
}

function RoleRow({ role }: { role: any }) {
  const roleColors: Record<string, string> = {
    OWNER: "border-amber-400/30 text-amber-400 bg-amber-400/5",
    MANAGER: "border-champagne/30 text-champagne bg-champagne/5",
    CONTENT_EDITOR: "border-blue-400/30 text-blue-400 bg-blue-400/5",
    STAFF: "border-green-400/30 text-green-400 bg-green-400/5",
  };

  return (
    <div className="flex items-center justify-between rounded-sm border border-white/5 bg-white/5 p-3">
      <div className="flex items-center gap-3">
        <Shield className="h-4 w-4 text-champagne" />
        <div>
          <div className="font-medium text-ivory">
            {role.profiles?.first_name || role.profiles?.last_name
              ? `${role.profiles.first_name || ""} ${role.profiles.last_name || ""}`.trim()
              : "Utilisateur"}
          </div>
          <div className="text-xs text-muted-grey">{role.profiles?.email || "—"}</div>
        </div>
      </div>
      <span className={`rounded-full border px-2 py-1 text-xs ${roleColors[role.role] || "border-white/10 text-muted-grey"}`}>
        {role.role}
      </span>
    </div>
  );
}
