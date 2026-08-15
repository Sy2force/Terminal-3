import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();

  if (user) {
    const { redirect: redirectTo } = await searchParams;
    redirect(typeof redirectTo === "string" ? redirectTo : "/account");
  }

  return <LoginForm />;
}
