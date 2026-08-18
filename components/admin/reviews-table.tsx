"use client";

import { useTransition } from "react";
import { Star, Eye, EyeOff, Trash2 } from "lucide-react";
import { publishReview, unpublishReview, deleteReview } from "@/app/admin/reviews/actions";
import type { ProductReviewRow } from "@/types/database";

interface ReviewWithProduct extends ProductReviewRow {
  products: { name_fr: string | null }[] | null;
}

export function ReviewsTable({ reviews }: { reviews: ReviewWithProduct[] }) {
  const [isPending, startTransition] = useTransition();

  if (reviews.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-[#E7DECE] bg-white p-8 text-center">
        <p className="text-sm text-[#71695F]">Aucun avis pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-[#E7DECE] bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-[#FBF8F1]">
          <tr className="text-left text-xs uppercase tracking-wider text-[#71695F]">
            <th className="px-4 py-3 font-medium">Produit</th>
            <th className="px-4 py-3 font-medium">Auteur</th>
            <th className="px-4 py-3 font-medium">Note</th>
            <th className="px-4 py-3 font-medium">Commentaire</th>
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E7DECE]">
          {reviews.map((review) => (
            <tr key={review.id} className="hover:bg-[#FBF8F1]/50">
              <td className="px-4 py-3 text-[#151411]">{review.products?.[0]?.name_fr ?? "—"}</td>
              <td className="px-4 py-3 text-[#151411]">{review.author_name}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 text-[#C6A15B]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i < review.rating ? "fill-current" : "text-[#E7DECE]"}`}
                    />
                  ))}
                </div>
              </td>
              <td className="max-w-xs truncate px-4 py-3 text-[#71695F]">{review.comment}</td>
              <td className="px-4 py-3">
                {review.is_published ? (
                  <span className="rounded-sm bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Publié</span>
                ) : (
                  <span className="rounded-sm bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">En attente</span>
                )}
              </td>
              <td className="px-4 py-3 text-[#71695F]">
                {new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "2-digit" }).format(
                  new Date(review.created_at),
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {review.is_published ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => startTransition(() => { void unpublishReview(review.id); })}
                      className="rounded-sm border border-[#E7DECE] p-2 text-[#71695F] hover:border-[#C6A15B] hover:text-[#C6A15B]"
                      aria-label="Dépublier"
                      title="Dépublier"
                    >
                      <EyeOff className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => startTransition(() => { void publishReview(review.id); })}
                      className="rounded-sm border border-[#E7DECE] p-2 text-[#71695F] hover:border-[#C6A15B] hover:text-[#C6A15B]"
                      aria-label="Publier"
                      title="Publier"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      if (confirm("Supprimer définitivement cet avis ?")) {
                        startTransition(() => { void deleteReview(review.id); });
                      }
                    }}
                    className="rounded-sm border border-[#E7DECE] p-2 text-[#9B3444] hover:border-[#9B3444] hover:bg-[#9B3444]/5"
                    aria-label="Supprimer"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
