import type { LucideIcon } from "lucide-react";
import { requireAdminPermission } from "@/lib/admin/auth";
import { getAllProducts } from "@/lib/data/products";
import { formatAgorot } from "@/lib/money";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";

export default async function InventoryPage() {
  await requireAdminPermission("catalog.products");
  const products = await getAllProducts();

  const inStock = products.filter((p) => p.availability_status === "IN_STOCK").length;
  const lowStock = products.filter((p) => p.availability_status === "LOW_STOCK").length;
  const outOfStock = products.filter((p) => p.availability_status === "OUT_OF_STOCK").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-noir-profond">Gestion des stocks</h1>
        <p className="mt-1 text-sm text-gris-chaud">
          Suivi de l&rsquo;inventaire et alertes de stock
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <InventoryCard
          label="En stock"
          value={inStock}
          icon={Package}
          color="text-green-400"
          borderColor="border-green-400/30"
        />
        <InventoryCard
          label="Stock faible"
          value={lowStock}
          icon={AlertTriangle}
          color="text-amber-700"
          borderColor="border-amber-300"
        />
        <InventoryCard
          label="Rupture"
          value={outOfStock}
          icon={TrendingDown}
          color="text-red-400"
          borderColor="border-red-400/30"
        />
      </div>

      <div className="overflow-hidden rounded-sm border border-beige-fonce">
        <table className="w-full text-left text-sm">
          <thead className="bg-white text-noir-profond/70">
            <tr>
              <th className="px-4 py-3 font-normal">Produit</th>
              <th className="px-4 py-3 font-normal">Catégorie</th>
              <th className="px-4 py-3 font-normal">Prix</th>
              <th className="px-4 py-3 font-normal">Statut</th>
              <th className="px-4 py-3 font-normal">Variantes</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-fonce">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="font-medium text-noir-profond">
                    {product.name_fr || product.name_he}
                  </div>
                  <div className="text-xs text-gris-chaud">{product.brand || "—"}</div>
                </td>
                <td className="px-4 py-3 text-noir-profond/80">
                  {product.category?.name_fr || product.category?.name_he || "—"}
                </td>
                <td className="px-4 py-3 text-noir-profond/80">
                  {product.base_price_agorot ? formatAgorot(product.base_price_agorot) : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={product.availability_status} />
                </td>
                <td className="px-4 py-3 text-gris-chaud">
                  {product.variants?.length || 0}
                </td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={`/admin/products/${product.id}`}
                    className="text-xs text-or-principal hover:text-soft-gold"
                  >
                    Modifier
                  </a>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gris-chaud">
                  Aucun produit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {lowStock > 0 && (
        <div className="rounded-sm border border-amber-300 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Alertes de stock faible</span>
          </div>
          <p className="mt-2 text-sm text-noir-profond/80">
            {lowStock} produit{lowStock > 1 ? "s" : ""} en stock faible. Vérifiez l&rsquo;inventaire.
          </p>
        </div>
      )}
    </div>
  );
}

function InventoryCard({
  label,
  value,
  icon: Icon,
  color,
  borderColor,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  borderColor: string;
}) {
  return (
    <div className={`flex flex-col rounded-sm border ${borderColor} bg-creme p-5`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gris-chaud">{label}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <span className={`mt-2 font-serif text-3xl ${color}`}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    IN_STOCK: "text-green-400",
    LOW_STOCK: "text-amber-700",
    OUT_OF_STOCK: "text-red-400",
    PREORDER: "text-blue-400",
    ON_REQUEST: "text-gris-chaud",
  };
  const labels: Record<string, string> = {
    IN_STOCK: "En stock",
    LOW_STOCK: "Stock faible",
    OUT_OF_STOCK: "Rupture",
    PREORDER: "Précommande",
    ON_REQUEST: "Sur commande",
  };
  return <span className={`text-xs ${styles[status] ?? "text-gris-chaud"}`}>{labels[status] || status}</span>;
}
