import { notFound } from "next/navigation";
import { requireAdminPermission } from "@/lib/admin/auth";
import { getPostByIdForAdmin } from "@/lib/data/content-admin";
import { ContentForm } from "@/components/admin/content-form";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPermission("marketing.content");
  const { id } = await params;
  const post = await getPostByIdForAdmin(id);
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-noir-profond">Modifier l&apos;article</h1>
      <ContentForm initial={post} />
    </div>
  );
}
