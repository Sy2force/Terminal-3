import { redirect } from "next/navigation";
import { Sparkles, Check } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getMyLoyaltyAccount, listLoyaltyTiers } from "@/lib/data/loyalty";
import { formatAgorot } from "@/lib/money";

export default async function CompteFidelitePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/compte/fidelite");

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- loyalty_transactions not yet in generated Database type
  const db = supabase as any;
  const [loyalty, tiers, { data: transactions }] = await Promise.all([
    getMyLoyaltyAccount(),
    listLoyaltyTiers(),
    db
      .from("loyalty_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
      <span className="text-xs uppercase tracking-[0.3em] text-champagne">Mon compte</span>
      <h1 className="mt-2 font-serif text-3xl text-ivory">Fidélité Terminal 3</h1>

      <div className="mt-8 rounded-sm border border-champagne/20 bg-champagne/5 p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-champagne" />
          <span className="font-serif text-xl text-ivory">
            Niveau {loyalty?.tier?.nameFr ?? "Découverte"}
          </span>
        </div>
        <p className="mt-2 text-sm text-ivory/70">
          {loyalty?.pointsBalance ?? 0} points · {formatAgorot(loyalty?.totalSpentAgorot ?? 0)} dépensés au total
        </p>
      </div>

      <div className="mt-8">
        <h2 className="font-serif text-lg text-ivory">Les niveaux</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {tiers.map((tier) => {
            const isCurrent = tier.id === loyalty?.tier?.id;
            return (
              <div
                key={tier.id}
                className={`rounded-sm border p-5 ${
                  isCurrent ? "border-champagne bg-champagne/5" : "border-white/5 bg-graphite"
                }`}
              >
                <p className="font-serif text-lg text-ivory">{tier.nameFr}</p>
                <p className="mt-1 text-xs text-muted-grey">
                  Dès {formatAgorot(tier.minSpendAgorot)} dépensés
                </p>
                <ul className="mt-3 flex flex-col gap-1.5">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-xs text-ivory/70">
                      <Check className="h-3 w-3 text-champagne" /> {perk}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-serif text-lg text-ivory">Historique des points</h2>
        {!transactions || transactions.length === 0 ? (
          <p className="mt-3 text-sm text-muted-grey">Aucun mouvement de points pour le moment.</p>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-white/5 border-y border-white/5">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(transactions as any[]).map((tx) => (
              <li key={tx.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="text-ivory">{tx.reason}</p>
                  <p className="text-xs text-muted-grey">
                    {new Date(tx.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <span className={tx.delta_points >= 0 ? "text-champagne" : "text-red-400"}>
                  {tx.delta_points >= 0 ? "+" : ""}
                  {tx.delta_points}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
