import { requireAdminPermission } from "@/lib/admin/auth";
import { FileText } from "lucide-react";
import Link from "next/link";

const PAGES = [
  { slug: "home", label: "Accueil" },
  { slug: "vins", label: "Vins" },
  { slug: "spiritueux", label: "Spiritueux" },
  { slug: "charcuterie", label: "Charcuterie" },
  { slug: "poissons", label: "Poissons" },
  { slug: "plateaux", label: "Plateaux" },
  { slug: "nouveautes", label: "Nouveautés" },
  { slug: "promotions", label: "Promotions" },
  { slug: "inspirations", label: "Inspirations" },
  { slug: "club", label: "Club" },
  { slug: "a-propos", label: "À propos" },
  { slug: "contact", label: "Contact" },
  { slug: "footer", label: "Footer" },
];

export default async function ContenusPage() {
  await requireAdminPermission("marketing.content");

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-[#151411]">Pages et contenus</h1>
      <p className="text-sm text-[#71695F]">Modifier les textes, titres, boutons et liens de chaque page.</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PAGES.map((page) => (
          <Link
            key={page.slug}
            href={`/admin/contenus/${page.slug}`}
            className="flex items-center gap-3 rounded-sm border border-[#E7DECE] bg-white p-4 shadow-sm transition-all hover:border-[#C6A15B] hover:shadow-md"
          >
            <FileText className="h-5 w-5 text-[#71695F]" />
            <span className="font-medium text-[#151411]">{page.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
