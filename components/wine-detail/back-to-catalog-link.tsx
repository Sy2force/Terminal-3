"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * Uses the browser history (`back()`) whenever the visitor actually came
 * from the catalog, so their search/filters/sort and scroll position are
 * preserved exactly as left. Falls back to a plain link to `basePath` when
 * there is no such history (e.g. direct link, new tab).
 */
export function BackToCatalogLink({
  basePath = "/vins",
  label = "Retour aux vins",
  className,
}: {
  basePath?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  function handleClick(e: React.MouseEvent) {
    if (typeof document !== "undefined" && document.referrer.includes(basePath)) {
      e.preventDefault();
      router.back();
    }
  }

  return (
    <Link
      href={basePath}
      onClick={handleClick}
      className={
        className ??
        "flex items-center gap-1.5 text-xs uppercase tracking-widest text-bordeaux-principal hover:underline"
      }
    >
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
      {label}
    </Link>
  );
}
