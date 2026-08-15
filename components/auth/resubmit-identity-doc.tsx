"use client";

import { useRouter } from "next/navigation";
import { IdentityDocUpload } from "@/components/auth/identity-doc-upload";

export function ResubmitIdentityDoc({ userId }: { userId: string }) {
  const router = useRouter();
  return (
    <IdentityDocUpload
      userId={userId}
      side="front"
      label="Nouvelle photo du recto de votre pièce d'identité"
      onUploaded={() => router.refresh()}
    />
  );
}
