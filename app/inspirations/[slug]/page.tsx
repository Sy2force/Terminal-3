import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/data/content";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | Terminal Journal`,
    description: post.subtitle ?? undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.subtitle ?? undefined,
    },
  };
}

export default async function InspirationArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
      <header className="mb-10">
        {post.category && (
          <span className="text-xs uppercase tracking-[0.3em] text-champagne">
            {post.category}
          </span>
        )}
        <h1 className="mt-2 font-serif text-3xl text-ivory sm:text-4xl">
          {post.title}
        </h1>
        {post.subtitle && (
          <p className="mt-3 text-base text-muted-grey">{post.subtitle}</p>
        )}
      </header>

      {post.hero_image_url && (
        <div className="relative mb-10 aspect-[16/9] w-full overflow-hidden rounded-sm bg-warm-black">
          <Image
            src={post.hero_image_url}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 768px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      {post.body && (
        <div className="prose prose-invert max-w-none whitespace-pre-line text-sm leading-relaxed text-ivory/80">
          {post.body}
        </div>
      )}

      {post.sections.length > 0 && (
        <div className="mt-10 flex flex-col gap-10">
          {post.sections.map((section) => (
            <section key={section.id}>
              {section.heading && (
                <h2 className="font-serif text-xl text-ivory">
                  {section.heading}
                </h2>
              )}
              {section.image_url && (
                <div className="relative mt-4 aspect-[16/9] w-full overflow-hidden rounded-sm bg-warm-black">
                  <Image
                    src={section.image_url}
                    alt={section.heading ?? post.title}
                    fill
                    sizes="(min-width: 1024px) 768px, 100vw"
                    className="object-cover"
                  />
                </div>
              )}
              {section.body && (
                <p className="mt-3 text-sm leading-relaxed text-ivory/70">
                  {section.body}
                </p>
              )}
            </section>
          ))}
        </div>
      )}

      {post.featuredProducts.length > 0 && (
        <div className="mt-14 border-t border-white/5 pt-10">
          <h2 className="font-serif text-xl text-ivory">
            Retrouvez cette sélection chez Terminal 3
          </h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {post.featuredProducts.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/products/${product.slug}`}
                  className="rounded-full border border-champagne/40 px-4 py-2 text-sm text-champagne transition-colors hover:bg-champagne hover:text-obsidian"
                >
                  {product.name_fr || product.name_he}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
