import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { LogoutButton } from "@/components/account/logout-button";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Produits" },
  { href: "/admin/categories", label: "Catégories" },
  { href: "/admin/inventory", label: "Stocks" },
  { href: "/admin/homepage", label: "Accueil" },
  { href: "/admin/content", label: "Inspirations" },
  { href: "/admin/promotions", label: "Promotions" },
  { href: "/admin/orders", label: "Commandes" },
  { href: "/admin/orders/queue", label: "File" },
  { href: "/admin/members", label: "Membres" },
  { href: "/admin/users", label: "Admins" },
  { href: "/admin/age-verifications", label: "Vérif. 18+" },
  { href: "/admin/store", label: "Boutique" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-obsidian">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-warm-black/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-serif text-lg text-champagne">
              Terminal 3 Admin
            </Link>
            <span className="hidden rounded-full border border-champagne/30 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-champagne sm:inline">
              {session.role}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="hidden text-sm text-ivory/70 hover:text-champagne sm:block"
            >
              Voir le site
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <nav
          aria-label="Navigation admin"
          className="hide-scrollbar flex gap-1 overflow-x-auto border-b border-white/5 py-3"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm text-ivory/70 transition-colors hover:bg-graphite hover:text-ivory"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="py-8">{children}</main>
      </div>
    </div>
  );
}
