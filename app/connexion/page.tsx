import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthCarousel } from "@/components/auth/auth-carousel";

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();

  if (user) {
    const { redirect: redirectTo } = await searchParams;
    redirect(typeof redirectTo === "string" ? redirectTo : "/compte");
  }

  return <AuthCarousel initialMode="login" />;
}
