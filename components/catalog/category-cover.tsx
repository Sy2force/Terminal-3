import Image from "next/image";
import type { ReactNode } from "react";
import { EditableText } from "@/components/admin/editable-text";
import { EditableImage } from "@/components/admin/editable-image";

interface CategoryCoverProps {
  imageUrl?: string | null;
  contentSlug?: string;
  pretitle: string;
  title: ReactNode;
  subtitle: ReactNode;
  children?: ReactNode;
}

export function CategoryCover({
  imageUrl,
  contentSlug,
  pretitle,
  title,
  subtitle,
  children,
}: CategoryCoverProps) {
  return (
    <div className="relative overflow-hidden bg-noir-chaud py-24 sm:py-28 lg:py-32">
      {imageUrl ? (
        <>
          <div className="absolute inset-0">
            {contentSlug ? (
              <EditableImage
                slug={contentSlug}
                field="og_image_url"
                src={imageUrl}
                alt={typeof title === "string" ? title : "Couverture"}
                fill
                className="object-cover"
                sizes="100vw"
              />
            ) : (
              <Image
                src={imageUrl}
                alt={typeof title === "string" ? title : "Couverture"}
                fill
                priority
                loading="eager"
                className="object-cover"
                sizes="100vw"
              />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-noir-profond/85 via-noir-profond/70 to-noir-profond/40" />
          <div className="absolute inset-0 bg-noir-profond/30" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-noir-chaud via-brun-cave to-bordeaux-fonce" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-or-principal/10" />
        </>
      )}

      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-or-principal">{pretitle}</p>
        <h1 className="mt-4 font-serif text-5xl leading-tight text-texte-clair sm:text-6xl lg:text-7xl">
          {contentSlug && typeof title === "string" ? (
            <EditableText slug={contentSlug} field="title" defaultValue={title}>
              {title}
            </EditableText>
          ) : (
            title
          )}
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-texte-clair/80 sm:text-lg">
          {contentSlug && typeof subtitle === "string" ? (
            <EditableText slug={contentSlug} field="subtitle" defaultValue={subtitle}>
              {subtitle}
            </EditableText>
          ) : (
            subtitle
          )}
        </p>
        {children}
      </div>
    </div>
  );
}
