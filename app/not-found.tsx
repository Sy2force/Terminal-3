import Link from "next/link";
import { Wine } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-fond-papier px-6 py-24 text-center">
      <Wine className="h-10 w-10 text-brun-cave/40" aria-hidden />
      <h1 className="mt-6 font-serif text-3xl text-noir-profond sm:text-4xl">
        Cette bouteille n&rsquo;est pas dans notre cave.
      </h1>
      <p className="mt-3 max-w-md text-sm text-gris-chaud">
        La page que vous cherchez n&rsquo;existe pas ou n&rsquo;est plus disponible.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-sm bg-bordeaux-principal px-6 py-3 text-sm font-medium uppercase tracking-widest text-texte-clair transition-colors hover:bg-bordeaux-fonce"
        >
          Retour à l&rsquo;accueil
        </Link>
        <Link
          href="/vins"
          className="rounded-sm border border-brun-cave/25 px-6 py-3 text-sm font-medium uppercase tracking-widest text-noir-profond transition-colors hover:border-bordeaux-principal hover:text-bordeaux-principal"
        >
          Explorer les vins
        </Link>
      </div>
    </div>
  );
}
