import { redirect } from "next/navigation";

// Superseded by /compte/verification — kept as a redirect so any existing
// bookmarks or links to /account/verification keep working.
export default function AccountVerificationRedirect() {
  redirect("/compte/verification");
}
