import { getEventOrders } from "@/lib/data/event-orders";

export const metadata = {
  title: "Mariages & Fêtes — Terminal 3",
};

export default async function AdminEvenementsPage() {
  const orders = await getEventOrders();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-[#151411]">Mariages & Fêtes</h1>
        <span className="rounded-full bg-[#692031] px-3 py-1 text-sm text-[#F7F0E4]">
          {orders.length} demande{orders.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="rounded-sm border border-[#EAE5DA] bg-white shadow-sm">
        {orders.length === 0 ? (
          <p className="p-6 text-[#71695F]">Aucune demande pour l'instant.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#EAE5DA] bg-[#FBF8F1]">
              <tr>
                <th className="px-4 py-3 font-medium text-[#71695F]">Référence</th>
                <th className="px-4 py-3 font-medium text-[#71695F]">Client</th>
                <th className="px-4 py-3 font-medium text-[#71695F]">Événement</th>
                <th className="px-4 py-3 font-medium text-[#71695F]">Statut</th>
                <th className="px-4 py-3 font-medium text-[#71695F]">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-[#EAE5DA] last:border-b-0">
                  <td className="px-4 py-3 font-medium text-[#151411]">{order.reference}</td>
                  <td className="px-4 py-3 text-[#151411]">{order.customer_name}</td>
                  <td className="px-4 py-3 text-[#151411]">{order.event_type}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-sm bg-[#C6A15B]/10 px-2 py-1 text-xs text-[#9B3444]">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#71695F]">
                    {new Date(order.created_at).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
