import Image from "next/image";
import Link from "next/link";
import type { SalmonGalleryImage } from "@/lib/settings";

/**
 * Only renders once real photos are configured in `site_settings.
 * SALMON_GALLERY_IMAGES` via /admin/store — no placeholder imagery
 * pretending to be real product photography.
 */
export function SalmonGallerySection({
  images,
}: {
  images: SalmonGalleryImage[];
}) {
  if (images.length === 0) return null;

  const [feature, ...rest] = images;

  return (
    <section className="border-y border-white/5 bg-warm-stone/10 py-24">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 lg:flex-row sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 lg:w-80 lg:shrink-0">
          <p className="text-xs uppercase tracking-[0.4em] text-amber/80">
            Chapitre 05
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-ivory">
            Plateaux Saumon
          </h2>
          <p className="text-sm leading-relaxed text-ivory/70">
            Composés à la demande pour vos tables et événements — chaque
            plateau est préparé le jour même par l&rsquo;atelier Sarfati,
            à la commande.
          </p>
          <Link
            href="/categories/saumon-fume"
            className="group mt-2 inline-flex items-center gap-2 rounded-full border border-amber/30 px-6 py-3 text-sm font-medium text-amber transition-all hover:border-amber hover:bg-amber/10"
          >
            Commander un plateau
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        <div className="relative -mx-6 flex-1 overflow-x-auto px-6 [scrollbar-width:none] lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
          <div className="flex snap-x snap-mandatory gap-5">
            <div className="relative aspect-[4/5] w-[78vw] shrink-0 snap-start overflow-hidden rounded-sm bg-obsidian sm:w-[46vw] lg:w-[28rem] border border-white/5">
              <Image
                src={feature.url}
                alt={feature.alt ?? "Plateau de saumon fumé Terminal 3"}
                fill
                sizes="(min-width: 1024px) 28rem, (min-width: 640px) 46vw, 78vw"
                className="object-cover"
                priority
              />
            </div>
            {rest.map((image, i) => (
              <div
                key={image.url}
                className="relative aspect-[4/5] w-[60vw] shrink-0 snap-start overflow-hidden rounded-sm bg-obsidian sm:w-[32vw] lg:w-80 border border-white/5"
              >
                <Image
                  src={image.url}
                  alt={image.alt ?? `Plateau de saumon fumé Terminal 3 ${i + 2}`}
                  fill
                  sizes="(min-width: 1024px) 20rem, (min-width: 640px) 32vw, 60vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
