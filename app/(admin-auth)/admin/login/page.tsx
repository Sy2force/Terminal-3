import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Connexion admin | Terminal 3",
};

interface AdminLoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const initialError = typeof params.error === "string" ? params.error : null;

  const session = await getAdminSession();
  if (session) {
    redirect("/admin");
  }

  return <LoginForm initialError={initialError} />;
}
