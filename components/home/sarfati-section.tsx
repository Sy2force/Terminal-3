import Link from "next/link";

export function SarfatiSection() {
  return (
    <section className="border-y border-white/5 bg-graphite">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2 lg:items-center lg:px-8">
        <div
          aria-hidden
          className="aspect-[4/3] w-full rounded-sm bg-[radial-gradient(circle_at_30%_30%,rgba(212,184,106,0.15),transparent_60%)] bg-warm-black"
        />

        <div className="flex flex-col gap-5">
          <span className="text-xs uppercase tracking-[0.3em] text-champagne">
            L&rsquo;atelier Sarfati
          </span>
          <h2 className="font-serif text-3xl text-ivory sm:text-4xl">
            Le saumon fumé, sublimé
          </h2>
          <p className="max-w-lg text-sm leading-relaxed text-ivory/70">
            Texture soyeuse, fumage artisanal, découpe précise : chaque pièce
            Sarfati est pensée pour la table. À déguster en fines tranches
            avec un trait de citron, ou en pièce entière pour une planche
            d&rsquo;exception.
          </p>
          <ul className="flex flex-wrap gap-3 text-xs uppercase tracking-widest text-muted-grey">
            <li className="rounded-full border border-white/10 px-3 py-1.5">Texture</li>
            <li className="rounded-full border border-white/10 px-3 py-1.5">Fumage</li>
            <li className="rounded-full border border-white/10 px-3 py-1.5">Service</li>
            <li className="rounded-full border border-white/10 px-3 py-1.5">Accord</li>
          </ul>
          <Link
            href="/categories/saumon-fume"
            className="mt-2 inline-flex w-fit items-center rounded-full border border-champagne/50 px-6 py-3 text-sm font-medium text-champagne transition-colors hover:bg-champagne hover:text-obsidian"
          >
            Découvrir les saumons
          </Link>
        </div>
      </div>
    </section>
  );
}
