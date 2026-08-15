import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, Package, Sparkles, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getMyVerificationProfile } from "@/lib/data/verification";
import { getMyLoyaltyAccount } from "@/lib/data/loyalty";
import { listMyNotifications, countMyUnreadNotifications } from "@/lib/data/customer-notifications";
import { listOrdersForCurrentUser } from "@/lib/data/orders";
import { formatAgorot } from "@/lib/money";
import { ORDER_STATUS_LABELS } from "@/lib/order-status-labels";
import { DEFAULT_BUSINESS_CONFIG } from "@/lib/config";

const STATUS_LABELS: Record<string, string> = {
  pending_verification: "En attente de vérification",
  verified: "Compte vérifié",
  rejected: "Document refusé",
  suspended: "Compte suspendu",
};

export default async function ComptePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/compte");

  const supabase = await createClient();
  const [profile, loyalty, orders, notifications, unreadCount, { count: favoritesCount }] =
    await Promise.all([
      getMyVerificationProfile(),
      getMyLoyaltyAccount(),
      listOrdersForCurrentUser(),
      listMyNotifications(5),
      countMyUnreadNotifications(),
      supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);

  const totalOrders = orders.length;
  const totalSpentAgorot = orders.reduce((sum, o) => sum + o.total_agorot, 0);
  const lastOrder = orders[0] ?? null;
  const activeOrder = orders.find((o) => !["completed", "cancelled"].includes(o.status)) ?? null;

  const initials = `${profile?.firstName?.[0] ?? ""}${profile?.lastName?.[0] ?? ""}`.toUpperCase() || "T3";

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-champagne/15 font-serif text-lg text-champagne">
            {initials}
          </div>
          <div>
            <h1 className="font-serif text-2xl text-ivory sm:text-3xl">
              Bonjour{profile?.firstName ? `, ${profile.firstName}` : ""}
            </h1>
            <p className="text-sm text-muted-grey">
              {profile?.clientNumber ?? "—"} · {STATUS_LABELS[profile?.verificationStatus ?? "pending_verification"]}
            </p>
          </div>
        </div>
        <a
          href={`https://wa.me/${DEFAULT_BUSINESS_CONFIG.STORE_WHATSAPP.replace(/[^\d]/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full border border-champagne/40 px-5 py-2.5 text-sm font-medium text-champagne transition-colors hover:bg-champagne/10"
        >
          Contacter Terminal 3
        </a>
      </div>

      {/* Stat cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-sm border border-white/5 bg-graphite/60 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-widest text-muted-grey">Commandes</p>
          <p className="mt-2 font-serif text-2xl text-ivory">{totalOrders}</p>
        </div>
        <div className="rounded-sm border border-white/5 bg-graphite/60 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-widest text-muted-grey">Total dépensé</p>
          <p className="mt-2 font-serif text-2xl text-champagne">{formatAgorot(totalSpentAgorot)}</p>
        </div>
        <div className="rounded-sm border border-white/5 bg-graphite/60 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-widest text-muted-grey">Points fidélité</p>
          <p className="mt-2 font-serif text-2xl text-ivory">{loyalty?.pointsBalance ?? 0}</p>
        </div>
        <div className="rounded-sm border border-white/5 bg-graphite/60 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-widest text-muted-grey">Favoris</p>
          <p className="mt-2 font-serif text-2xl text-ivory">{favoritesCount ?? 0}</p>
        </div>
      </div>

      {/* Loyalty progress */}
      {loyalty && (
        <div className="mt-6 rounded-sm border border-champagne/20 bg-champagne/5 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-champagne" />
              <span className="font-serif text-lg text-ivory">
                Niveau {loyalty.tier?.nameFr ?? "Découverte"}
              </span>
            </div>
            <Link href="/compte/fidelite" className="text-xs text-champagne hover:underline">
              Voir les avantages
            </Link>
          </div>
          {loyalty.nextTier && (
            <>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-champagne transition-all"
                  style={{ width: `${loyalty.progressToNextTierPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-grey">
                Encore {formatAgorot(Math.max(0, loyalty.nextTier.minSpendAgorot - loyalty.totalSpentAgorot))} pour
                atteindre le niveau {loyalty.nextTier.nameFr}.
              </p>
            </>
          )}
        </div>
      )}

      {/* Active order */}
      {activeOrder && (
        <div className="mt-6 rounded-sm border border-white/5 bg-graphite/60 p-6">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-champagne" />
            <span className="font-serif text-lg text-ivory">Commande en cours</span>
          </div>
          <p className="mt-2 text-sm text-ivory/70">
            Réf. {activeOrder.id.slice(0, 8).toUpperCase()} · {ORDER_STATUS_LABELS[activeOrder.status]}
          </p>
          <Link
            href={`/orders/${activeOrder.id}/tracking`}
            className="mt-3 inline-flex items-center gap-1 text-sm text-champagne hover:underline"
          >
            Suivre ma commande <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Quick links */}
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {[
          { href: "/compte/profil", label: "Mon profil" },
          { href: "/compte/verification", label: "Vérification d'identité" },
          { href: "/compte/commandes", label: "Mes commandes" },
          { href: "/compte/factures", label: "Mes factures" },
          { href: "/compte/favoris", label: "Mes favoris" },
          { href: "/compte/fidelite", label: "Fidélité" },
          { href: "/compte/adresses", label: "Mes adresses" },
          { href: "/compte/securite", label: "Sécurité" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between rounded-sm border border-white/5 bg-graphite px-5 py-4 text-sm text-ivory transition-colors hover:border-champagne/30"
          >
            {link.label}
            <ArrowRight className="h-4 w-4 text-muted-grey" aria-hidden />
          </Link>
        ))}
      </div>

      {/* Notifications */}
      <div className="mt-10">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-champagne" />
          <h2 className="font-serif text-lg text-ivory">Notifications</h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-champagne px-2 py-0.5 text-xs font-semibold text-obsidian">
              {unreadCount}
            </span>
          )}
        </div>
        {notifications.length === 0 ? (
          <p className="mt-3 text-sm text-muted-grey">Aucune notification pour le moment.</p>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-white/5 border-y border-white/5">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <p className={`text-sm ${n.readAt ? "text-ivory/60" : "text-ivory"}`}>{n.title}</p>
                  {n.body && <p className="mt-0.5 text-xs text-muted-grey">{n.body}</p>}
                </div>
                <span className="shrink-0 text-xs text-muted-grey">
                  {new Date(n.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Continue shopping */}
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/vins"
          className="rounded-full bg-champagne px-6 py-3 text-sm font-semibold text-obsidian transition-colors hover:bg-soft-gold"
        >
          Continuer mes achats
        </Link>
        {lastOrder && (
          <Link
            href={`/orders/${lastOrder.id}`}
            className="rounded-full border border-white/10 px-6 py-3 text-sm text-ivory/80 transition-colors hover:border-champagne hover:text-champagne"
          >
            Revoir ma dernière commande
          </Link>
        )}
      </div>
    </div>
  );
}
