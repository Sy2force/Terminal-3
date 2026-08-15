import { redirect } from "next/navigation";

// The full favorites experience already lives at /favoris.
export default function CompteFavorisRedirect() {
  redirect("/favoris");
}
