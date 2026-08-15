import { requireAdminPermission } from "@/lib/admin/auth";
import { getPageContentForAdmin } from "@/lib/data/page-contents";
import { isDemoMode } from "@/lib/demo-mode";
import { PageContentEditor } from "@/components/admin/page-content-editor";

const PAGE_LABELS: Record<string, string> = {
  home: "Accueil",
  vins: "Vins",
  spiritueux: "Spiritueux",
  charcuterie: "Charcuterie",
  poissons: "Poissons",
  plateaux: "Plateaux",
  nouveautes: "Nouveautés",
  promotions: "Promotions",
  inspirations: "Inspirations",
  club: "Club",
  "a-propos": "À propos",
  contact: "Contact",
  footer: "Footer",
};

export default async function ContenuDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdminPermission("marketing.content");
  const { slug } = await params;
  const demoMode = isDemoMode();

  const page = demoMode ? null : await getPageContentForAdmin(slug);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-[#151411]">
          Édition — {PAGE_LABELS[slug] ?? slug}
        </h1>
        <p className="mt-1 text-sm text-[#71695F]">
          Les modifications sont enregistrées en brouillon puis publiées explicitement.
        </p>
      </div>

      <div className="rounded-sm border border-[#E7DECE] bg-white p-6 shadow-sm">
        <PageContentEditor slug={slug} pageType="generic" page={page} demoMode={demoMode} />
      </div>
    </div>
  );
}
