import { Star } from "lucide-react";
import type { ProductReviewRow } from "@/types/database";
import { ReviewForm } from "@/components/wine-detail/review-form";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
}

export function WineReviews({
  productId,
  pagePath,
  aggregateRating,
  aggregateCount,
  reviews,
  canReview,
}: {
  productId: string;
  pagePath: string;
  aggregateRating: number | null;
  aggregateCount: number;
  reviews: ProductReviewRow[];
  canReview: boolean;
}) {
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="space-y-8">
      {/* Aggregate */}
      <div className="flex flex-wrap items-start gap-8">
        <div className="text-center">
          <p className="font-serif text-4xl text-noir-profond">
            {aggregateRating != null ? aggregateRating.toFixed(1) : "—"}
          </p>
          <div className="mt-1 flex justify-center gap-0.5 text-or-principal">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-3.5 w-3.5"
                fill={aggregateRating != null && i < Math.round(aggregateRating) ? "currentColor" : "none"}
                aria-hidden
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-gris-chaud">
            {aggregateCount} avis
          </p>
        </div>

        {reviews.length > 0 && (
          <div className="flex-1 space-y-1.5">
            {distribution.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2 text-xs text-gris-chaud">
                <span className="w-3">{star}</span>
                <Star className="h-3 w-3 text-or-principal" fill="currentColor" aria-hidden />
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-beige-fonce">
                  <div
                    className="h-full bg-or-principal"
                    style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review form */}
      {canReview && <ReviewForm productId={productId} pagePath={pagePath} />}

      {/* List */}
      {reviews.length === 0 ? (
        <p className="text-sm text-gris-chaud">
          Soyez le premier à donner votre avis sur cette bouteille.
        </p>
      ) : (
        <ul className="space-y-6">
          {reviews.map((review) => (
            <li key={review.id} className="border-b border-brun-cave/10 pb-6 last:border-0">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-noir-profond">{review.author_name}</p>
                <time dateTime={review.created_at} className="text-xs text-gris-chaud">
                  {formatDate(review.created_at)}
                </time>
              </div>
              <div className="mt-1 flex gap-0.5 text-or-principal">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5" fill={i < review.rating ? "currentColor" : "none"} aria-hidden />
                ))}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-noir-profond/80">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
