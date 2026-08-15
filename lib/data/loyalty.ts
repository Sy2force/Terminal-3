import "server-only";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export interface LoyaltyTier {
  id: string;
  key: string;
  nameFr: string;
  nameHe: string | null;
  minSpendAgorot: number;
  displayOrder: number;
  pointsMultiplier: number;
  perks: string[];
}

export interface LoyaltyAccount {
  pointsBalance: number;
  lifetimePoints: number;
  totalSpentAgorot: number;
  tier: LoyaltyTier | null;
  nextTier: LoyaltyTier | null;
  progressToNextTierPercent: number;
}

/** Base points rate: 1 point per this many agorot spent (before tier multiplier). */
const AGOROT_PER_POINT = 1000; // 1 point per 10₪

export async function listLoyaltyTiers(): Promise<LoyaltyTier[]> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- loyalty tables not yet in generated Database type
  const db = supabase as any;
  const { data } = await db
    .from("loyalty_tiers")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map((row) => ({
    id: row.id,
    key: row.key,
    nameFr: row.name_fr,
    nameHe: row.name_he,
    minSpendAgorot: row.min_spend_agorot,
    displayOrder: row.display_order,
    pointsMultiplier: Number(row.points_multiplier),
    perks: row.perks ?? [],
  }));
}

export async function getMyLoyaltyAccount(): Promise<LoyaltyAccount | null> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- loyalty tables not yet in generated Database type
  const db = supabase as any;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [tiers, accountResult] = await Promise.all([
    listLoyaltyTiers(),
    db.from("loyalty_accounts").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  const account = accountResult.data;
  const totalSpentAgorot = account?.total_spent_agorot ?? 0;
  const pointsBalance = account?.points_balance ?? 0;
  const lifetimePoints = account?.lifetime_points ?? 0;

  const sortedTiers = [...tiers].sort((a, b) => a.minSpendAgorot - b.minSpendAgorot);
  const currentTier =
    [...sortedTiers].reverse().find((t) => totalSpentAgorot >= t.minSpendAgorot) ?? null;
  const currentIndex = currentTier ? sortedTiers.findIndex((t) => t.id === currentTier.id) : -1;
  const nextTier = currentIndex >= 0 ? sortedTiers[currentIndex + 1] ?? null : sortedTiers[0] ?? null;

  const progressToNextTierPercent = nextTier
    ? Math.min(
        100,
        Math.round(
          ((totalSpentAgorot - (currentTier?.minSpendAgorot ?? 0)) /
            (nextTier.minSpendAgorot - (currentTier?.minSpendAgorot ?? 0))) *
            100,
        ),
      )
    : 100;

  return {
    pointsBalance,
    lifetimePoints,
    totalSpentAgorot,
    tier: currentTier,
    nextTier,
    progressToNextTierPercent,
  };
}

/**
 * Awards loyalty points for a completed order, server-side only. Creates
 * the customer's loyalty_accounts row on first purchase, updates their
 * total spend (which determines their tier), and writes an immutable
 * `loyalty_transactions` entry. Never callable from the client — always
 * invoked from `submitOrder` after the order is durably persisted.
 */
export async function awardLoyaltyPointsForOrder(
  userId: string,
  orderId: string,
  amountAgorot: number,
): Promise<void> {
  const service = createServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- loyalty tables not yet in generated Database type
  const db = service as any;

  const { data: account } = await db
    .from("loyalty_accounts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const previousTotalSpent = account?.total_spent_agorot ?? 0;
  const newTotalSpent = previousTotalSpent + amountAgorot;

  const { data: tiersData } = await db
    .from("loyalty_tiers")
    .select("*")
    .eq("is_active", true)
    .order("min_spend_agorot", { ascending: false });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applicableTier = ((tiersData ?? []) as any[]).find(
    (t) => newTotalSpent >= t.min_spend_agorot,
  );
  const multiplier = applicableTier ? Number(applicableTier.points_multiplier) : 1;
  const pointsEarned = Math.floor((amountAgorot / AGOROT_PER_POINT) * multiplier);

  const balanceBefore = account?.points_balance ?? 0;
  const balanceAfter = balanceBefore + pointsEarned;
  const lifetimePoints = (account?.lifetime_points ?? 0) + pointsEarned;

  await db.from("loyalty_accounts").upsert(
    {
      user_id: userId,
      tier_id: applicableTier?.id ?? null,
      points_balance: balanceAfter,
      lifetime_points: lifetimePoints,
      total_spent_agorot: newTotalSpent,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  await db.from("loyalty_transactions").insert({
    user_id: userId,
    order_id: orderId,
    delta_points: pointsEarned,
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    reason: "Points gagnés sur commande",
    origin: "automatic",
  });
}
