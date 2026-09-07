import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/data/content";
import { EmptyState } from "@/components/ui/empty-state";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Terminal Journal | Inspirations Terminal 3",
  description:
    "Accords, mises en table et idées d'apéritif signées Terminal 3 : vin, whisky, saumon fumé et charcuterie.",
};

export default async function InspirationsPage() {
  const posts = await getPublishedPosts(48);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <header className="mb-12 max-w-2xl">
        <span className="text-xs uppercase tracking-[0.3em] text-champagne">
          Terminal Journal
        </span>
        <h1 className="mt-2 font-serif text-3xl text-ivory sm:text-4xl">
          Inspirations
        </h1>
        <p className="mt-3 text-sm text-muted-grey">
          Accords, mises en table et rituels d&rsquo;apéritif — pensés pour
          être vécus, pas seulement lus.
        </p>
      </header>

      {posts.length === 0 ? (
        <EmptyState message="Le Terminal Journal arrive bientôt — accords, dégustations et coups de cœur." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/inspirations/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-sm border border-white/5 bg-graphite transition-colors hover:border-champagne/30"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-warm-black">
                {post.hero_image_url ? (
                  <Image
                    src={post.hero_image_url}
                    alt={post.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-grey">
                    Photo à venir
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-5">
                {post.category && (
                  <span className="text-[11px] uppercase tracking-widest text-champagne">
                    {post.category}
                  </span>
                )}
                <h2 className="font-serif text-lg leading-snug text-ivory">
                  {post.title}
                </h2>
                {post.subtitle && (
                  <p className="text-sm text-muted-grey">{post.subtitle}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
