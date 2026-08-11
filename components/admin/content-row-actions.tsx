"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { deletePostAction } from "@/app/admin/content/actions";

export function ContentRowActions({ postId }: { postId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Supprimer cet article ?")) return;
    startTransition(async () => {
      await deletePostAction(postId);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => router.push(`/admin/content/${postId}`)}
        disabled={pending}
        className="rounded p-1.5 text-ivory/60 hover:bg-graphite hover:text-champagne"
        aria-label="Modifier"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={handleDelete}
        disabled={pending}
        className="rounded p-1.5 text-red-400/60 hover:bg-graphite hover:text-red-400"
        aria-label="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
