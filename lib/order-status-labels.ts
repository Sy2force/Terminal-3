import type {
  OrderStatus,
  ExtendedOrderStatus,
  FoodFulfillmentStatus,
  AlcoholFulfillmentStatus,
} from "@/types/database";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Commande reçue",
  reviewing: "En cours de validation",
  accepted: "Acceptée par la boutique",
  preparing: "En préparation",
  ready: "Prête",
  collected: "Récupérée",
  submitted: "Commande envoyée",
  confirmed: "Confirmée par la boutique",
  completed: "Terminée",
  cancelled: "Annulée",
};

/**
 * Alias unifié (statuts hérités et étendus désormais dans le même enum).
 */
export const EXTENDED_ORDER_STATUS_LABELS: Record<ExtendedOrderStatus, string> = ORDER_STATUS_LABELS;

export const FOOD_STATUS_LABELS: Record<FoodFulfillmentStatus, string> = {
  SUBMITTED: "Envoyée",
  CONFIRMED: "Confirmée",
  READY: "Prête",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};

export const ALCOHOL_STATUS_LABELS: Record<AlcoholFulfillmentStatus, string> = {
  SUBMITTED: "Envoyée",
  PENDING_AGE_VERIFICATION: "En attente de vérification d'âge",
  AGE_VERIFIED: "Âge vérifié",
  READY: "Prête",
  COMPLETED: "Terminée",
  AGE_VERIFICATION_FAILED: "Vérification d'âge échouée",
  CANCELLED: "Annulée",
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status as OrderStatus] ?? status;
}

export function fulfillmentStatusLabel(
  type: "food" | "alcohol",
  status: string | null,
): string {
  if (!status) return "—";
  if (type === "alcohol") {
    return ALCOHOL_STATUS_LABELS[status as AlcoholFulfillmentStatus] ?? status;
  }
  return FOOD_STATUS_LABELS[status as FoodFulfillmentStatus] ?? status;
}
