import type { Metadata } from "next";
import { getPlatterProducts, getPublishedProducts } from "@/lib/data/catalog";
import { WineBreadcrumb } from "@/components/wine-detail/wine-breadcrumb";
import { PlatterComposer } from "@/components/plateaux/platter-composer";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Composer mon plateau | Terminal 3",
  description: "Choisissez votre plateau, son format et ajoutez des suppléments pour votre réception.",
  alternates: { canonical: "/plateaux/composer" },
};

export default async function PlatterComposerPage({
  searchParams,
}: {
  searchParams: Promise<{ base?: string }>;
}) {
  const { base } = await searchParams;
  const [platters, charcuterie, fish] = await Promise.all([
    getPlatterProducts(),
    getPublishedProducts({ categorySlug: "charcuterie", limit: 6 }),
    getPublishedProducts({ categorySlug: "saumon-fume", limit: 6 }),
  ]);

  // Real published charcuterie/fish products only — never fabricated
  // "supplement" items just to fill the configurator.
  const supplements = [...charcuterie, ...fish].filter((p) => p.variants?.length);

  return (
    <div className="min-h-screen bg-fond-papier">
      <WineBreadcrumb basePath="/plateaux" catalogLabel="Plateaux" domaine={null} name="Composer mon plateau" />

      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-bordeaux-principal">Configurateur</p>
          <h1 className="mt-2 font-serif text-4xl text-noir-profond sm:text-5xl">
            Composer mon plateau
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-gris-chaud">
            Choisissez votre plateau, son format, et ajoutez des suppléments pour composer la
            réception qui vous correspond.
          </p>
        </div>

        <PlatterComposer platters={platters} supplements={supplements} initialBaseSlug={base} />
      </div>
    </div>
  );
}
