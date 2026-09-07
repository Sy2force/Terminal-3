"use client";

import { useState, useTransition } from "react";
import { createLead, updateLeadStatus, convertLead } from "@/app/admin/leads/actions";

export interface LeadRow {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: string;
  status: string;
  interest: string | null;
  createdAt: string;
  convertedUserId: string | null;
}

const STATUSES = ["new", "to_contact", "contacted", "interested", "converting", "converted", "lost"] as const;
const STATUS_LABELS: Record<string, string> = {
  new: "Nouveau",
  to_contact: "À contacter",
  contacted: "Contacté",
  interested: "Intéressé",
  converting: "Conversion en cours",
  converted: "Converti",
  lost: "Perdu",
};

export function LeadsBoard({ initialLeads }: { initialLeads: LeadRow[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [view, setView] = useState<"table" | "kanban">("table");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", interest: "" });
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = await createLead({ name: form.name, phone: form.phone || undefined, email: form.email || undefined, interest: form.interest || undefined, source: "manual" });
    if (!result.success) {
      setError(result.error ?? "Erreur.");
      return;
    }
    window.location.reload();
  }

  function handleStatusChange(leadId: string, status: (typeof STATUSES)[number]) {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
    startTransition(() => {
      void updateLeadStatus(leadId, status);
    });
  }

  async function handleConvert(leadId: string) {
    const result = await convertLead(leadId);
    if (!result.success) {
      setError(result.error ?? "Erreur.");
      return;
    }
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: "converted" } : l)));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView("table")}
            className={`rounded-full px-4 py-1.5 text-xs ${view === "table" ? "bg-or-principal text-noir-profond" : "border border-beige-fonce text-noir-profond/70"}`}
          >
            Tableau
          </button>
          <button
            type="button"
            onClick={() => setView("kanban")}
            className={`rounded-full px-4 py-1.5 text-xs ${view === "kanban" ? "bg-or-principal text-noir-profond" : "border border-beige-fonce text-noir-profond/70"}`}
          >
            Kanban
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full border border-or-principal/40 px-4 py-1.5 text-xs text-or-principal hover:bg-or-principal/10"
        >
          + Nouveau lead
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="flex flex-wrap gap-3 rounded-sm border border-beige-fonce bg-white p-4">
          <input required placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2 text-sm text-noir-profond" />
          <input placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2 text-sm text-noir-profond" />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2 text-sm text-noir-profond" />
          <input placeholder="Intérêt" value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} className="rounded-sm border border-beige-fonce bg-fond-papier px-3 py-2 text-sm text-noir-profond" />
          <button type="submit" className="rounded-full bg-or-principal px-4 py-2 text-xs font-semibold text-noir-profond">Créer</button>
          {error && <p className="w-full text-xs text-amber-700">{error}</p>}
        </form>
      )}

      {leads.length === 0 ? (
        <div className="rounded-sm border border-beige-fonce bg-white p-12 text-center text-sm text-gris-chaud">
          Aucun lead pour le moment.
        </div>
      ) : view === "table" ? (
        <div className="overflow-x-auto rounded-sm border border-beige-fonce">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-beige-fonce text-xs uppercase tracking-wide text-gris-chaud">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Créé le</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-beige-fonce last:border-0">
                  <td className="px-4 py-3 text-noir-profond">{lead.name}</td>
                  <td className="px-4 py-3 text-noir-profond/70">
                    <p>{lead.email}</p>
                    <p className="text-xs text-gris-chaud">{lead.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gris-chaud">{lead.source}</td>
                  <td className="px-4 py-3">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value as (typeof STATUSES)[number])}
                      className="rounded-sm border border-beige-fonce bg-fond-papier px-2 py-1 text-xs text-noir-profond"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-gris-chaud">{new Date(lead.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3 text-right">
                    {!lead.convertedUserId && (
                      <button type="button" onClick={() => handleConvert(lead.id)} className="text-xs text-or-principal hover:underline">
                        Convertir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 overflow-x-auto sm:grid-cols-3 lg:grid-cols-7">
          {STATUSES.map((status) => (
            <div key={status} className="min-w-[200px] rounded-sm border border-beige-fonce bg-creme p-3">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-or-principal">
                {STATUS_LABELS[status]} ({leads.filter((l) => l.status === status).length})
              </p>
              <div className="flex flex-col gap-2">
                {leads.filter((l) => l.status === status).map((lead) => (
                  <div key={lead.id} className="rounded-sm border border-beige-fonce bg-fond-papier p-3 text-xs">
                    <p className="font-medium text-noir-profond">{lead.name}</p>
                    <p className="text-gris-chaud">{lead.phone || lead.email}</p>
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value as (typeof STATUSES)[number])}
                      className="mt-2 w-full rounded-sm border border-beige-fonce bg-white px-2 py-1 text-[11px] text-noir-profond"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
