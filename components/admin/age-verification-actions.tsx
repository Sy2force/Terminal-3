"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { verifyAgeAction } from "@/app/admin/orders/actions";

export function AgeVerificationActions({
  verificationId,
}: {
  verificationId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleVerify(status: "VERIFIED" | "FAILED") {
    startTransition(async () => {
      await verifyAgeAction(verificationId, status);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleVerify("VERIFIED")}
        className="rounded-sm bg-or-principal px-4 py-2 text-xs font-semibold text-noir-profond transition-colors hover:bg-or-clair disabled:opacity-50"
      >
        Valider 18+
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleVerify("FAILED")}
        className="rounded-sm border border-amber-400/40 px-4 py-2 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 disabled:opacity-50"
      >
        Refuser
      </button>
    </div>
  );
}
