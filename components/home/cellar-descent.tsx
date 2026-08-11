import Link from "next/link";

export function CellarDescentSection() {
  return (
    <section className="relative min-h-[60vh] flex flex-col items-center justify-center overflow-hidden bg-obsidian">
      {/* Tunnel effect - converging lines */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(197,163,90,0.08),transparent_70%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0)_0%,rgba(45,15,15,0.3)_50%,rgba(8,8,8,0)_100%)]"
      />

      {/* Perspective lines */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `
            repeating-linear-gradient(
              90deg,
              transparent 0%,
              transparent 48%,
              rgba(197,163,90,0.03) 48%,
              rgba(197,163,90,0.03) 52%,
              transparent 52%
            )
          `,
        }}
      />

      <div className="relative z-10 flex max-w-4xl flex-col items-center gap-6 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.5em] text-champagne/60">
          Chapitre 01
        </p>

        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ivory leading-tight">
          Descendez dans la cave
        </h2>

        <p className="max-w-xl text-sm sm:text-base text-ivory/60 leading-relaxed">
          Laissez-vous guider à travers notre sélection de vins d&apos;exception,
          whiskies rares et spiritueux prestigieux.
        </p>

        <Link
          href="/categories"
          className="mt-4 inline-flex items-center gap-2 text-champagne/80 text-sm uppercase tracking-[0.2em] transition-colors hover:text-champagne"
        >
          Explorer la collection
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </Link>
      </div>

      {/* Bottom fade */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-obsidian to-transparent"
      />
    </section>
  );
}
