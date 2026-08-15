import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BackToCatalogLink } from "@/components/wine-detail/back-to-catalog-link";

export function WineBreadcrumb({
  basePath = "/vins",
  catalogLabel = "Vins",
  domaine,
  name,
}: {
  /** e.g. "/vins" or "/spiritueux" */
  basePath?: string;
  /** e.g. "Vins" or "Spiritueux" */
  catalogLabel?: string;
  domaine: string | null;
  name: string;
}) {
  return (
    <div className="border-b border-brun-cave/15 bg-fond-papier">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs text-gris-chaud">
          <Link href="/" className="hover:text-bordeaux-principal">
            Accueil
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <Link href={basePath} className="hover:text-bordeaux-principal">
            {catalogLabel}
          </Link>
          {domaine && (
            <>
              <ChevronRight className="h-3 w-3" aria-hidden />
              <span>{domaine}</span>
            </>
          )}
          <ChevronRight className="h-3 w-3" aria-hidden />
          <span aria-current="page" className="text-noir-profond">
            {name}
          </span>
        </nav>

        <BackToCatalogLink basePath={basePath} label={`Retour aux ${catalogLabel.toLowerCase()}`} />
      </div>
    </div>
  );
}
