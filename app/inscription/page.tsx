import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SignupForm } from "@/components/auth/signup-form";

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();

  if (user) {
    const { redirect: redirectTo } = await searchParams;
    redirect(typeof redirectTo === "string" ? redirectTo : "/account");
  }

  return <SignupForm />;
}
