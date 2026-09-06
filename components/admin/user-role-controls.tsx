"use client";

import { useState } from "react";
import { setUserRoleAction, revokeUserRoleAction } from "@/app/admin/users/actions";
import type { AdminRoleType } from "@/types/database";

const ROLES: AdminRoleType[] = ["OWNER", "MANAGER", "CONTENT_EDITOR", "STAFF", "COURIER"];

export function AssignRoleControl({ userId, isOwner }: { userId: string; isOwner: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOwner) return null;

  async function handleAssign(role: string) {
    if (!role) return;
    setPending(true);
    setError(null);
    const result = await setUserRoleAction(userId, role);
    setPending(false);
    if (!result.success) setError(result.error ?? "Erreur");
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <select
        disabled={pending}
        defaultValue=""
        onChange={(e) => handleAssign(e.target.value)}
        className="rounded-sm border border-beige-fonce bg-creme px-2 py-1 text-[10px] text-noir-profond"
      >
        <option value="" disabled>Attribuer un rôle...</option>
        {ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      {error && <span className="text-[10px] text-amber-700">{error}</span>}
    </div>
  );
}

export function RevokeRoleButton({ roleId, isOwner }: { roleId: string; isOwner: boolean }) {
  const [pending, setPending] = useState(false);

  if (!isOwner) return null;

  async function handleRevoke() {
    if (!confirm("Retirer ce rôle ?")) return;
    setPending(true);
    await revokeUserRoleAction(roleId);
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleRevoke}
      disabled={pending}
      className="text-[10px] text-amber-700 hover:text-amber-300 disabled:opacity-50"
    >
      Retirer
    </button>
  );
}
