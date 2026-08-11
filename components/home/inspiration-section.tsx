import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import type { ContentPostRow } from "@/types/database";

export function InspirationSection({ posts }: { posts: ContentPostRow[] }) {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-24 sm:px-8 lg:px-12">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-champagne/60 mb-3">
            Le Journal Terminal 3
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-ivory">
            Inspirations
          </h2>
        </div>
        <Link
          href="/inspirations"
          className="group hidden items-center gap-2 text-sm text-ivory/70 hover:text-champagne sm:inline-flex"
        >
          Tout voir
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

      {posts.length === 0 ? (
        <EmptyState
          className="mt-8"
          message="De nouvelles sélections arrivent bientôt."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <Link
              key={post.id}
              href={`/inspirations/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-sm border border-white/5 bg-graphite transition-all hover:border-champagne/30 hover:bg-bordeaux/10"
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
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 to-transparent" />
              </div>
              <div className="p-6">
                {post.category && (
                  <span className="text-[11px] uppercase tracking-widest text-champagne/80">
                    {post.category}
                  </span>
                )}
                <h3 className="mt-2 font-serif text-lg leading-snug text-ivory group-hover:text-champagne transition-colors">
                  {post.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
