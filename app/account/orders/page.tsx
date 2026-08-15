import { redirect } from "next/navigation";

// Superseded by /compte/commandes.
export default function AccountOrdersRedirect() {
  redirect("/compte/commandes");
}
