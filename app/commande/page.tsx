import { redirect } from "next/navigation";

// "/commande" is the French-facing entry point for the checkout flow —
// the implementation lives at /checkout (existing cart/order wiring),
// kept as the canonical route to avoid duplicating the order logic.
export default function CommandeRedirect() {
  redirect("/checkout");
}
