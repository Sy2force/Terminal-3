import { requireAdminPermission } from "@/lib/admin/auth";
import { listVerificationRequests } from "@/app/admin/verifications/actions";
import { VerificationRequestsList } from "@/components/admin/verification-requests-list";

export default async function AdminVerificationsPage() {
  await requireAdminPermission("customers.verify");
  const requests = await listVerificationRequests();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-ivory">Vérifications d&rsquo;identité</h1>
        <p className="mt-1 text-sm text-muted-grey">
          {requests.length} demande{requests.length > 1 ? "s" : ""} à traiter
        </p>
      </div>

      <VerificationRequestsList initialRequests={requests} />
    </div>
  );
}
