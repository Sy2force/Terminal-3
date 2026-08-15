"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { submitProductReview } from "@/app/reviews/actions";

export function ReviewForm({
  productId,
  pagePath,
}: {
  productId: string;
  /** Full path of the product page, e.g. "/vins/petit-castel-2020". */
  pagePath: string;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rating === 0) {
      setStatus("error");
      setMessage("Merci de choisir une note.");
      return;
    }
    const formData = new FormData();
    formData.set("rating", String(rating));
    formData.set("comment", comment);

    startTransition(async () => {
      const result = await submitProductReview(pagePath, productId, formData);
      if (!result.success) {
        setStatus("error");
        setMessage(result.error ?? "Une erreur est survenue.");
        return;
      }
      setStatus("success");
      setMessage("Merci pour votre avis !");
      setRating(0);
      setComment("");
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-sm border border-brun-cave/15 bg-white/40 p-5"
    >
      <div>
        <span className="block text-xs font-medium uppercase tracking-widest text-bordeaux-principal">
          Votre note
        </span>
        <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Votre note">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={rating === value}
                aria-label={`${value} étoile${value > 1 ? "s" : ""}`}
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 text-or-principal"
              >
                <Star
                  className="h-6 w-6"
                  fill={value <= (hoverRating || rating) ? "currentColor" : "none"}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="review-comment" className="block text-xs font-medium uppercase tracking-widest text-bordeaux-principal">
          Votre commentaire
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          required
          minLength={3}
          maxLength={2000}
          placeholder="Partagez votre expérience avec cette bouteille…"
          className="mt-2 w-full rounded-sm border border-brun-cave/25 bg-white px-3 py-2 text-sm text-noir-profond placeholder:text-gris-chaud focus:border-bordeaux-principal focus:outline-none"
        />
      </div>

      {message && (
        <p className={`text-sm ${status === "success" ? "text-green-800" : "text-bordeaux-principal"}`} role="status">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-sm bg-bordeaux-principal px-6 py-2.5 text-sm uppercase tracking-widest text-texte-clair transition-colors hover:bg-bordeaux-fonce disabled:opacity-50"
      >
        {isPending ? "Envoi…" : "Publier mon avis"}
      </button>
    </form>
  );
}
