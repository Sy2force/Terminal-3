import { requireAdminPermission } from "@/lib/admin/auth";
import { ContentForm } from "@/components/admin/content-form";

export default async function NewContentPage() {
  await requireAdminPermission("marketing.content");

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-ivory">Nouvel article</h1>
      <ContentForm />
    </div>
  );
}
