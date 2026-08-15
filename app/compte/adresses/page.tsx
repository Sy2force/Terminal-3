import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AddressManager, type AddressRow } from "@/components/account/address-manager";

export default async function CompteAdressesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/compte/adresses");

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- customer_addresses not yet in generated Database type
  const db = supabase as any;
  const { data } = await db
    .from("customer_addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addresses: AddressRow[] = ((data ?? []) as any[]).map((row) => ({
    id: row.id,
    city: row.city,
    street: row.street,
    buildingNumber: row.building_number,
    apartment: row.apartment,
    postalCode: row.postal_code,
    deliveryInstructions: row.delivery_instructions,
    isDefault: row.is_default,
  }));

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-8">
      <span className="text-xs uppercase tracking-[0.3em] text-champagne">Mon compte</span>
      <h1 className="mt-2 font-serif text-3xl text-ivory">Mes adresses</h1>

      <div className="mt-8">
        <AddressManager initialAddresses={addresses} />
      </div>
    </div>
  );
}
