import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SecurityPanel } from "@/components/account/security-panel";

export default async function CompteSecuritePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/compte/securite");

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-8">
      <span className="text-xs uppercase tracking-[0.3em] text-champagne">Mon compte</span>
      <h1 className="mt-2 font-serif text-3xl text-ivory">Sécurité</h1>

      <div className="mt-8">
        <SecurityPanel />
      </div>
    </div>
  );
}
