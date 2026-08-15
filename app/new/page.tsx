import { redirect } from "next/navigation";

// "/nouveautes" is the canonical new-arrivals page — this route is kept
// only so existing links/bookmarks still resolve, avoiding two parallel
// implementations of the same listing.
export default function NewArrivalsRedirect() {
  redirect("/nouveautes");
}
