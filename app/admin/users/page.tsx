import { requireAdminPermission } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { Shield, Clock, LogOut } from "lucide-react";
import { AssignRoleControl, RevokeRoleButton } from "@/components/admin/user-role-controls";
import { signOutAdmin } from "@/app/admin/logout/actions";
import type { ProfileRow, AdminRoleType } from "@/types/database";

interface UserWithRoles extends ProfileRow {
  admin_roles: { role: AdminRoleType }[] | null;
}

interface RoleWithProfile {
  id: string;
  user_id: string;
  role: AdminRoleType;
  profiles: Pick<ProfileRow, "first_name" | "last_name" | "email"> | null;
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "Jamais";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function AdminUsersPage() {
  const session = await requireAdminPermission("admin.users");
  const isOwner = session.role === "OWNER";
  const supabase = await createClient();

  const [{ data: users }, { data: roles }, { data: logins }, { data: { session: currentSession } }] = await Promise.all([
    supabase
      .from("profiles")
      .select(`
        *,
        admin_roles (
          role
        )
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("admin_roles")
      .select(`
        id,
        user_id,
        role,
        profiles (
          first_name,
          last_name,
          email
        )
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("audit_logs")
      .select("actor_user_id, created_at")
      .eq("action", "login")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase.auth.getSession(),
  ]);

  const lastLoginByUser = new Map<string, string>();
  for (const log of logins ?? []) {
    if (log.actor_user_id && !lastLoginByUser.has(log.actor_user_id)) {
      lastLoginByUser.set(log.actor_user_id, log.created_at);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ivory">Utilisateurs admin</h1>
          <p className="mt-1 text-sm text-muted-grey">Gestion des rôles, permissions et dernières connexions.</p>
        </div>
      </div>

      <div className="rounded-sm border border-white/5 bg-graphite/30 p-5">
        <h2 className="mb-4 font-serif text-lg text-champagne">Session active</h2>
        {currentSession ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-ivory">{currentSession.user.email}</p>
              <p className="text-xs text-muted-grey">
                Expire le {" "}
                {formatDate(
                  currentSession.expires_at
                    ? new Date(currentSession.expires_at * 1000).toISOString()
                    : null,
                )}
              </p>
            </div>
            <form action={signOutAdmin}>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-sm bg-[#9B3444]/10 px-4 py-2 text-sm font-medium text-[#9B3444] transition-colors hover:bg-[#9B3444]/20"
              >
                <LogOut className="h-4 w-4" />
                Déconnecter toutes les sessions
              </button>
            </form>
          </div>
        ) : (
          <p className="text-sm text-muted-grey">Aucune session active.</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Users without admin roles */}
        <div className="rounded-sm border border-white/5 bg-graphite/30 p-5">
          <h2 className="font-serif text-lg text-champagne mb-4">Utilisateurs</h2>
          <div className="space-y-3">
            {users?.map((user: UserWithRoles) => (
              <UserRow
                key={user.id}
                user={user}
                isOwner={isOwner}
                lastLogin={lastLoginByUser.get(user.id) ?? null}
              />
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
            {roles?.map((role: RoleWithProfile) => (
              <RoleRow
                key={role.id}
                role={role}
                isOwner={isOwner}
                lastLogin={lastLoginByUser.get(role.user_id) ?? null}
              />
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

function UserRow({
  user,
  isOwner,
  lastLogin,
}: {
  user: UserWithRoles;
  isOwner: boolean;
  lastLogin: string | null;
}) {
  const hasRole = user.admin_roles && user.admin_roles.length > 0;

  return (
    <div className="flex flex-col gap-2 rounded-sm border border-white/5 bg-white/5 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="font-medium text-ivory">
          {user.first_name || user.last_name
            ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
            : "Utilisateur"}
        </div>
        <div className="text-xs text-muted-grey">{user.email || "—"}</div>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-grey">
          <Clock className="h-3 w-3" />
          Dernière connexion : {formatDate(lastLogin)}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {hasRole ? (
          <span className="rounded-full border border-champagne/30 px-2 py-1 text-xs text-champagne">
            {user.admin_roles?.[0].role}
          </span>
        ) : (
          <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-muted-grey">Aucun rôle</span>
        )}
        <AssignRoleControl userId={user.id} isOwner={isOwner} />
      </div>
    </div>
  );
}

function RoleRow({
  role,
  isOwner,
  lastLogin,
}: {
  role: RoleWithProfile;
  isOwner: boolean;
  lastLogin: string | null;
}) {
  const roleColors: Record<string, string> = {
    OWNER: "border-amber-400/30 text-amber-400 bg-amber-400/5",
    MANAGER: "border-champagne/30 text-champagne bg-champagne/5",
    CONTENT_EDITOR: "border-blue-400/30 text-blue-400 bg-blue-400/5",
    STAFF: "border-green-400/30 text-green-400 bg-green-400/5",
  };

  return (
    <div className="flex flex-col gap-2 rounded-sm border border-white/5 bg-white/5 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Shield className="mt-0.5 h-4 w-4 text-champagne" />
        <div>
          <div className="font-medium text-ivory">
            {role.profiles?.first_name || role.profiles?.last_name
              ? `${role.profiles.first_name || ""} ${role.profiles.last_name || ""}`.trim()
              : "Utilisateur"}
          </div>
          <div className="text-xs text-muted-grey">{role.profiles?.email || "—"}</div>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-grey">
            <Clock className="h-3 w-3" />
            Dernière connexion : {formatDate(lastLogin)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`rounded-full border px-2 py-1 text-xs ${roleColors[role.role] || "border-white/10 text-muted-grey"}`}>
          {role.role}
        </span>
        <RevokeRoleButton roleId={role.id} isOwner={isOwner} />
      </div>
    </div>
  );
}
