"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { ClubMembershipRow, MembershipTierRow, ProfileRow } from "@/types/database";

interface MembershipWithProfile extends ClubMembershipRow {
  profile: ProfileRow | null;
  tier: MembershipTierRow | null;
}

export function MembersList({
  memberships,
  tiers,
}: {
  memberships: MembershipWithProfile[];
  tiers: MembershipTierRow[];
}) {
  const [query, setQuery] = useState("");

  const filtered = memberships.filter((m) => {
    if (!query) return true;
    const name = `${m.profile?.first_name ?? ""} ${m.profile?.last_name ?? ""}`.toLowerCase();
    const email = (m.profile?.email ?? "").toLowerCase();
    const phone = m.profile?.phone ?? "";
    return name.includes(query.toLowerCase()) || email.includes(query.toLowerCase()) || phone.includes(query);
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-grey" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un membre..."
          className="w-full rounded-full border border-white/10 bg-graphite py-2 pl-10 pr-4 text-sm text-ivory placeholder:text-muted-grey"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-sm border border-white/5 bg-graphite p-12 text-center text-sm text-muted-grey">
          {memberships.length === 0
            ? "Aucun membre inscrit pour le moment."
            : "Aucun résultat pour cette recherche."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs uppercase tracking-widest text-muted-grey">
                <th className="pb-3 pr-4">Membre</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Téléphone</th>
                <th className="pb-3 pr-4">Inscrit le</th>
                <th className="pb-3 pr-4">Niveau</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-white/5">
                  <td className="py-3 pr-4 text-ivory">
                    {m.profile?.first_name || m.profile?.last_name
                      ? `${m.profile?.first_name ?? ""} ${m.profile?.last_name ?? ""}`.trim()
                      : "—"}
                  </td>
                  <td className="py-3 pr-4 text-ivory/70">
                    {m.profile?.email ?? "—"}
                  </td>
                  <td className="py-3 pr-4 text-ivory/70">
                    {m.profile?.phone ?? "—"}
                  </td>
                  <td className="py-3 pr-4 text-ivory/70">
                    {new Date(m.joined_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 pr-4">
                    {m.tier ? (
                      <span className="rounded-full border border-champagne/30 px-2.5 py-0.5 text-xs text-champagne">
                        {m.tier.name}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-grey">Membre</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tiers.length > 0 && (
        <div className="mt-8 border-t border-white/5 pt-6">
          <h2 className="font-serif text-lg text-ivory">Niveaux d&apos;adhésion</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="rounded-sm border border-white/5 bg-graphite px-4 py-3"
              >
                <span className="text-sm font-medium text-ivory">{tier.name}</span>
                {tier.discount_percent > 0 && (
                  <span className="ml-2 text-xs text-champagne">
                    -{tier.discount_percent}%
                  </span>
                )}
                {tier.description && (
                  <p className="mt-1 text-xs text-muted-grey">{tier.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
