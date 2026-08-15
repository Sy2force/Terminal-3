import Image from "next/image";
import { GlassButton } from "@/components/ui/glass-button";
import type { PageBlock } from "@/lib/data/page-contents";

interface PageContentRendererProps {
  blocks: PageBlock[] | unknown;
}

export function PageContentRenderer({ blocks }: PageContentRendererProps) {
  const list = (Array.isArray(blocks) ? blocks : []) as PageBlock[];

  return (
    <div className="space-y-12">
      {list
        .filter((b) => b.visible !== false)
        .map((block) => {
          switch (block.type) {
            case "hero":
              return (
                <div key={block.id} className="text-center">
                  {block.heading && (
                    <h2 className="font-serif text-3xl text-texte-clair sm:text-4xl">
                      {block.heading}
                    </h2>
                  )}
                  {block.subheading && (
                    <p className="mt-2 text-texte-clair/70">{block.subheading}</p>
                  )}
                  {block.body && (
                    <p className="mx-auto mt-4 max-w-3xl text-texte-clair/60">{block.body}</p>
                  )}
                </div>
              );

            case "text":
              return (
                <div key={block.id} className="max-w-3xl">
                  {block.heading && (
                    <h3 className="font-serif text-2xl text-texte-clair">{block.heading}</h3>
                  )}
                  {block.subheading && (
                    <p className="mt-1 text-sm text-texte-clair/60">{block.subheading}</p>
                  )}
                  {block.body && (
                    <div className="mt-4 space-y-4 text-texte-clair/70 leading-relaxed">
                      {block.body.split("\n\n").map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                </div>
              );

            case "cta":
              return (
                <div key={block.id} className="rounded-sm bg-bordeaux-principal/10 p-8 text-center">
                  {block.heading && (
                    <h3 className="font-serif text-2xl text-texte-clair">{block.heading}</h3>
                  )}
                  {block.body && <p className="mt-2 text-texte-clair/70">{block.body}</p>}
                  {block.buttonLabel && block.buttonHref && (
                    <div className="mt-6">
                      <GlassButton href={block.buttonHref} variant="gold">
                        {block.buttonLabel}
                      </GlassButton>
                    </div>
                  )}
                </div>
              );

            case "image":
              return (
                <figure key={block.id} className="mx-auto max-w-4xl">
                  {block.mediaUrl ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-sm border border-or-principal/20">
                      <Image
                        src={block.mediaUrl}
                        alt={block.mediaAlt || block.heading || "Image"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 900px"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-sm border border-or-principal/20 bg-noir-chaud" />
                  )}
                  {(block.heading || block.body) && (
                    <figcaption className="mt-3 text-sm text-texte-clair/60">
                      {block.heading || block.body}
                    </figcaption>
                  )}
                </figure>
              );

            case "video":
              return (
                <div key={block.id} className="mx-auto max-w-4xl">
                  {block.mediaUrl ? (
                    <video
                      controls
                      preload="metadata"
                      className="aspect-video w-full rounded-sm border border-or-principal/20 bg-noir-chaud"
                    >
                      <source src={block.mediaUrl} />
                    </video>
                  ) : (
                    <div className="aspect-video w-full rounded-sm border border-or-principal/20 bg-noir-chaud" />
                  )}
                </div>
              );

            default:
              return null;
          }
        })}
    </div>
  );
}
