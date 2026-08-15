import { redirect } from "next/navigation";

// Superseded by /compte, the new premium account dashboard.
export default function AccountRedirect() {
  redirect("/compte");
}
