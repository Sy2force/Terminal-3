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
          <h1 className="font-serif text-2xl text-ivory">Inspirations</h1>
          <p className="mt-1 text-sm text-muted-grey">
            {posts.length} article{posts.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/content/new"
          className="rounded-full bg-champagne px-5 py-2 text-sm font-semibold text-obsidian transition-colors hover:bg-soft-gold"
        >
          Nouvel article
        </Link>
      </div>

      <div className="overflow-hidden rounded-sm border border-white/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-graphite text-ivory/70">
            <tr>
              <th className="px-4 py-3 font-normal">Titre</th>
              <th className="px-4 py-3 font-normal">Catégorie</th>
              <th className="px-4 py-3 font-normal">Statut</th>
              <th className="px-4 py-3 font-normal">Date</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium text-ivory">
                  {post.title}
                </td>
                <td className="px-4 py-3 text-muted-grey">
                  {post.category ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <ContentStatusBadge status={post.status} />
                </td>
                <td className="px-4 py-3 text-muted-grey">
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
                <td colSpan={5} className="px-4 py-8 text-center text-muted-grey">
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
    draft: "text-muted-grey",
    scheduled: "text-ivory",
    published: "text-champagne",
  };
  return (
    <span className={`text-xs ${styles[status] ?? "text-ivory"}`}>
      {labels[status] ?? status}
    </span>
  );
}
