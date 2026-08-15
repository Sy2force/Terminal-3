import type { PaymentMethod } from "@/types/database";

const LABELS: Record<PaymentMethod, string> = {
  cash_store: "Espèces magasin",
  cash_delivery: "Espèces livraison",
  card_store: "Carte magasin",
  card_delivery: "Carte livraison",
  wolt: "Wolt",
  refund: "Remboursement",
  manual: "Autre",
};

export function paymentMethodLabel(method: PaymentMethod | null | undefined): string {
  if (!method) return "Non spécifié";
  return LABELS[method] ?? method;
}
