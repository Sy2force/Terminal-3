"use client";

import { useState, useTransition } from "react";
import { assignRole, revokeRole, type AdminUserRow } from "@/app/admin/roles/actions";
import { ALL_ADMIN_ROLES } from "@/lib/admin/roles";
import type { AdminRoleType } from "@/types/database";

const ROLE_LABELS: Record<AdminRoleType, string> = {
  OWNER: "Propriétaire",
  MANAGER: "Manager",
  CONTENT_EDITOR: "Éditeur de contenu",
  STAFF: "Staff",
  COURIER: "Livreur",
  ORDER_MANAGER: "Gestionnaire commandes",
  DELIVERY_MANAGER: "Gestionnaire livraisons",
  CUSTOMER_SUPPORT: "Support client",
};

export function RolesManager({
  initialUsers,
  isOwner,
}: {
  initialUsers: AdminUserRow[];
  isOwner: boolean;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRoleType>("STAFF");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = await assignRole(email, role);
    if (!result.success) {
      setError(result.error ?? "Erreur.");
      return;
    }
    setEmail("");
    window.location.reload();
  }

  function handleRevoke(userId: string) {
    if (!confirm("Confirmez-vous le retrait de ce rôle ?")) return;
    startTransition(async () => {
      const result = await revokeRole(userId);
      if (result.success) {
        setUsers((prev) => prev.filter((u) => u.userId !== userId));
      } else {
        setError(result.error ?? "Erreur.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {isOwner && (
        <form onSubmit={handleAssign} className="flex flex-wrap items-end gap-3 rounded-sm border border-beige-fonce bg-white p-5">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gris-chaud">Email du compte</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@terminal3.co.il"
              className="rounded-sm border border-beige-fonce bg-fond-papier px-4 py-2.5 text-sm text-noir-profond outline-none focus:border-or-principal"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gris-chaud">Rôle</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRoleType)}
              className="rounded-sm border border-beige-fonce bg-fond-papier px-4 py-2.5 text-sm text-noir-profond outline-none focus:border-or-principal"
            >
              {ALL_ADMIN_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-full bg-or-principal px-6 py-2.5 text-sm font-semibold text-noir-profond hover:bg-or-clair"
          >
            Attribuer
          </button>
          {error && <p className="w-full text-sm text-amber-700">{error}</p>}
        </form>
      )}

      <div className="overflow-x-auto rounded-sm border border-beige-fonce">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-beige-fonce text-xs uppercase tracking-wide text-gris-chaud">
              <th className="px-4 py-3">Administrateur</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Depuis</th>
              {isOwner && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.userId} className="border-b border-beige-fonce last:border-0">
                <td className="px-4 py-3 text-noir-profond">
                  {u.firstName || u.lastName ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() : u.email}
                  <p className="text-xs text-gris-chaud">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-or-principal/10 px-2.5 py-0.5 text-xs text-or-principal">
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gris-chaud">
                  {new Date(u.assignedAt).toLocaleDateString("fr-FR")}
                </td>
                {isOwner && (
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRevoke(u.userId)}
                      disabled={isPending}
                      className="text-xs text-red-400 hover:underline disabled:opacity-50"
                    >
                      Retirer
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
