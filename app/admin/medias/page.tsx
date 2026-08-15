import { requireAdminPermission } from "@/lib/admin/auth";
import { isDemoMode } from "@/lib/demo-mode";
import { listMedia } from "@/lib/data/media";
import { MediaLibrary } from "@/components/admin/media-library";

export default async function MediasPage() {
  await requireAdminPermission("catalog.media");

  const media = isDemoMode() ? [] : await listMedia();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-[#151411]">Médiathèque</h1>
        <p className="mt-1 text-sm text-[#71695F]">
          Images et vidéos utilisées sur le site. Un média utilisé ne peut pas être supprimé.
        </p>
      </div>

      {isDemoMode() && (
        <div className="rounded-sm border border-[#B97832]/30 bg-[#B97832]/10 px-4 py-3 text-sm text-[#B97832]">
          Mode démo actif : aucune base Supabase connectée, la médiathèque est vide et l&apos;upload ne peut pas être enregistré.
        </div>
      )}

      <MediaLibrary initialMedia={media} />
    </div>
  );
}
