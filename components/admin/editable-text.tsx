"use client";

import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useAdminEdit } from "./admin-edit-mode";
import { savePageContentFieldAction } from "@/app/admin/page-content/actions";

interface EditableTextProps {
  slug: string;
  field: "title" | "subtitle" | "description";
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

export function EditableText({
  slug,
  field,
  defaultValue,
  className,
  children,
}: EditableTextProps) {
  const { isEditing } = useAdminEdit();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isEditing) {
    return <span className={className}>{children}</span>;
  }

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await savePageContentFieldAction({
        slug,
        field,
        value,
        pageType: "page",
      });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <span className={className}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={saving}
          className="w-full rounded-sm border border-or-principal bg-noir-profond px-2 py-1 text-sm text-noir-profond focus:border-or-principal focus:outline-none"
        />
        {error && <span className="ml-2 text-xs text-red-300">{error}</span>}
        <span className="ml-2 inline-flex gap-1">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-sm bg-green-800 p-1 text-noir-profond hover:bg-green-700"
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setValue(defaultValue);
              setError(null);
            }}
            disabled={saving}
            className="rounded-sm bg-red-900 p-1 text-noir-profond hover:bg-red-800"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      </span>
    );
  }

  return (
    <span
      className={`group relative inline-block ${className ?? ""}`}
      onClick={() => setEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setEditing(true);
      }}
    >
      <span className="rounded-sm group-hover:outline group-hover:outline-1 group-hover:outline-or-principal/60 group-hover:outline-offset-2">
        {children}
      </span>
      <Pencil className="absolute -right-5 -top-2 h-3.5 w-3.5 text-or-principal opacity-0 group-hover:opacity-100" />
    </span>
  );
}
