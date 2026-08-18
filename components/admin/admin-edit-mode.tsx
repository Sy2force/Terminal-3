"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { AdminSession, AdminPermission } from "@/lib/admin/auth";

interface AdminEditContextValue {
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  canEdit: boolean;
  permission: (p: AdminPermission) => boolean;
}

const AdminEditContext = createContext<AdminEditContextValue | null>(null);

export function useAdminEdit() {
  return useContext(AdminEditContext) ?? { isEditing: false, setIsEditing: () => {}, canEdit: false, permission: () => false };
}

export function AdminEditModeProvider({
  session,
  children,
}: {
  session: AdminSession | null;
  children: ReactNode;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const canEdit = !!session && (session.role === "OWNER" || session.role === "MANAGER" || session.role === "CONTENT_EDITOR");

  const permission = (p: AdminPermission): boolean => {
    if (!session) return false;
    if (session.role === "OWNER" || session.role === "MANAGER") return true;
    if (session.role === "CONTENT_EDITOR" && p === "marketing.content") return true;
    return false;
  };

  return (
    <AdminEditContext.Provider value={{ isEditing, setIsEditing, canEdit, permission }}>
      {children}
      {canEdit && (
        <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-full border border-or-principal/30 bg-noir-profond/95 px-4 py-2 shadow-lg backdrop-blur-sm print:hidden">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              isEditing
                ? "bg-champagne text-obsidian"
                : "bg-or-principal/10 text-or-principal hover:bg-or-principal/20"
            }`}
          >
            {isEditing ? "Quitter le mode édition" : "Administrer le site"}
          </button>
          {isEditing && (
            <span className="text-xs text-ivory/70">
              Survolez un texte ou une image pour les modifier.
            </span>
          )}
        </div>
      )}
    </AdminEditContext.Provider>
  );
}
