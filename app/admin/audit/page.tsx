import { redirect } from "next/navigation";

// /admin/historique already implements the full audit trail UI backed by
// `audit_logs`. This route exists as the name requested in the spec and
// simply points to it, rather than duplicating the page.
export default function AdminAuditRedirect() {
  redirect("/admin/historique");
}
