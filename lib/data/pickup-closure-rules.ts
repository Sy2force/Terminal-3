import type { OrderRow } from "@/types/database";

/**
 * Pure business rules for the pickup-closure workflow (no server-only or
 * DB dependency, so this file is safe to import from tests and from
 * client components alike). Server-side helpers that write to the DB live
 * in `./pickup-closure.ts`.
 *
 * An order can only be marked "collected" once:
 *   1. Payment is confirmed in store (`payment_status = 'paid_in_store'`)
 *   2. The physical ID check has been recorded (`id_checked_at`) when the
 *      order contains at least one age-restricted item.
 */

export interface OrderClosureContext {
  order: Pick<
    OrderRow,
    | "id"
    | "status"
    | "payment_status"
    | "payment_method_actual"
    | "paid_at"
    | "id_checked_at"
    | "id_checked_by"
  >;
  hasAgeRestrictedItem: boolean;
}

export interface ClosureRule {
  ok: boolean;
  reason?: string;
}

export function canConfirmPayment(ctx: OrderClosureContext): ClosureRule {
  if (ctx.order.payment_status === "paid_in_store") {
    return { ok: false, reason: "Le paiement a déjà été confirmé." };
  }
  return { ok: true };
}

export function canCloseOrder(ctx: OrderClosureContext): ClosureRule {
  if (ctx.order.status === "completed") {
    return { ok: false, reason: "Commande déjà clôturée." };
  }
  if (ctx.order.status === "cancelled") {
    return { ok: false, reason: "Commande annulée." };
  }
  if (ctx.order.payment_status !== "paid_in_store") {
    return {
      ok: false,
      reason: "Le paiement en magasin doit être confirmé avant clôture.",
    };
  }
  if (ctx.hasAgeRestrictedItem && !ctx.order.id_checked_at) {
    return {
      ok: false,
      reason:
        "Un contrôle physique de la pièce d'identité (18+) est obligatoire avant clôture.",
    };
  }
  return { ok: true };
}

export function paymentMethodLabel(method: string | null | undefined): string {
  switch (method) {
    case "cash":
      return "Espèces";
    case "card":
      return "Carte";
    case "bit":
      return "Bit";
    case null:
    case undefined:
      return "Non défini";
    default:
      return "Autre";
  }
}
