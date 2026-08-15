import { redirect } from "next/navigation";

// "/favoris" is the canonical favorites page (single source of truth —
// see components/favorites/*); this account-area route is kept only so
// existing links/bookmarks still resolve.
export default function AccountFavoritesRedirect() {
  redirect("/favoris");
}
