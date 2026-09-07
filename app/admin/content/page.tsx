import Link from "next/link";
import { requireAdminPermission } from "@/lib/admin/auth";
import { getAllPostsForAdmin } from "@/lib/data/content-admin";
import { ContentRowActions } from "@/components/admin/content-row-actions";

export default async function AdminContentPage() {
  await requireAdminPermission("marketing.content");
  const posts = await getAllPostsForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-noir-profond">Inspirations</h1>
          <p className="mt-1 text-sm text-gris-chaud">
            {posts.length} article{posts.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/content/new"
          className="rounded-full bg-or-principal px-5 py-2 text-sm font-semibold text-noir-profond transition-colors hover:bg-or-clair"
        >
          Nouvel article
        </Link>
      </div>

      <div className="overflow-hidden rounded-sm border border-beige-fonce">
        <table className="w-full text-left text-sm">
          <thead className="bg-white text-noir-profond/70">
            <tr>
              <th className="px-4 py-3 font-normal">Titre</th>
              <th className="px-4 py-3 font-normal">Catégorie</th>
              <th className="px-4 py-3 font-normal">Statut</th>
              <th className="px-4 py-3 font-normal">Date</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-fonce">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium text-noir-profond">
                  {post.title}
                </td>
                <td className="px-4 py-3 text-gris-chaud">
                  {post.category ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <ContentStatusBadge status={post.status} />
                </td>
                <td className="px-4 py-3 text-gris-chaud">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString("fr-FR")
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <ContentRowActions postId={post.id} />
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gris-chaud">
                  Aucun article.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContentStatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    draft: "Brouillon",
    scheduled: "Programmé",
    published: "Publié",
  };
  const styles: Record<string, string> = {
    draft: "text-gris-chaud",
    scheduled: "text-noir-profond",
    published: "text-or-principal",
  };
  return (
    <span className={`text-xs ${styles[status] ?? "text-noir-profond"}`}>
      {labels[status] ?? status}
    </span>
  );
}
