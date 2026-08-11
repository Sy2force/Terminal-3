"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/favorites/actions";

export function FavoriteButton({
  productId,
  initialFavorited,
  className,
  variant = "icon",
}: {
  productId: string;
  initialFavorited: boolean;
  className?: string;
  variant?: "icon" | "labeled";
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    // Product cards wrap this in a <Link> — never navigate on favorite clicks.
    e.preventDefault();
    e.stopPropagation();

    const next = !favorited;
    setFavorited(next);
    startTransition(async () => {
      const result = await toggleFavorite(productId);
      if (!result.success) {
        setFavorited(!next);
        if (result.error?.includes("connecté")) {
          router.push("/login?redirect=/products");
        }
        return;
      }
      setFavorited(result.favorited);
    });
  }

  if (variant === "labeled") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={favorited}
        className={`flex items-center gap-2 text-sm transition-colors ${
          favorited ? "text-champagne" : "text-ivory/70 hover:text-champagne"
        } ${className ?? ""}`}
      >
        <Heart
          className="h-4 w-4"
          fill={favorited ? "currentColor" : "none"}
          aria-hidden
        />
        {favorited ? "Dans vos favoris" : "Ajouter aux favoris"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={`rounded-full bg-obsidian/60 p-2 backdrop-blur-sm transition-colors hover:text-champagne ${
        favorited ? "text-champagne" : "text-ivory"
      } ${className ?? ""}`}
    >
      <Heart
        className="h-4 w-4"
        fill={favorited ? "currentColor" : "none"}
        aria-hidden
      />
    </button>
  );
}
