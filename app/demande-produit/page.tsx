import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { ProductRequestForm } from "@/components/product-request/product-request-form";

export const metadata: Metadata = {
  title: "Demander un produit | Terminal 3",
  description:
    "Cherchez un produit dans le catalogue Terminal 3 ou faites une demande pour un produit absent.",
};

export default async function DemandeProduitPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const redirectTo = `/demande-produit${
    params.q ? `?q=${encodeURIComponent(String(params.q))}` : ""
  }`;

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }

  return (
    <div className="min-h-screen bg-obsidian">
      <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        <p className="text-xs uppercase tracking-widest text-champagne">Terminal 3</p>
        <h1 className="mt-2 font-serif text-3xl text-ivory">
          Demander un produit
        </h1>
        <p className="mt-3 text-sm text-ivory/70">
          Commencez par chercher le produit dans notre catalogue. Si vous ne le
          trouvez pas, vous pourrez décrire ce que vous cherchez : nous
          reviendrons vers vous avec un devis ou une alternative.
        </p>

        <div className="mt-6 rounded-sm border border-white/5 bg-graphite/40 p-4">
          <p className="flex items-start gap-2 text-xs text-ivory/70">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-champagne" />
            Cette demande ne constitue pas une commande. Vous recevrez une
            réponse dans votre <Link href="/compte/demandes" className="text-champagne hover:underline">espace demandes</Link>
            {" "}avant tout achat.
          </p>
        </div>

        <ProductRequestForm />
      </div>
    </div>
  );
}
