import type { Metadata } from "next";
import { searchProducts } from "@/lib/data/catalog";
import { SearchResults } from "@/components/search/search-results";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Recherche | Terminal 3",
  description: "Recherchez un vin, un spiritueux, une charcuterie ou un poisson dans la sélection Terminal 3.",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const initialResults = query ? await searchProducts(query) : [];

  return (
    <div className="min-h-screen bg-fond-papier">
      <div className="border-b border-brun-cave/15 bg-noir-chaud py-14 sm:py-16">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-or-principal">Recherche</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-texte-clair sm:text-5xl">
            Que cherchez-vous ?
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
        <SearchResults initialQuery={query} initialResults={initialResults} />
      </div>
    </div>
  );
}
