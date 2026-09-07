"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateOrderStatusAction } from "@/app/admin/orders/actions";
import type { OrderStatus } from "@/types/database";

/**
 * Quick status actions for the dashboard "Commandes récentes" block.
 * No online payment exists — payment and ID check happen in store at
 * pickup, so "Récupérée" means paid + collected in store.
 */
export function DashboardOrderActions({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function setStatus(next: OrderStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, next);
      if (!result.success) setError(result.error ?? "Échec");
      router.refresh();
    });
  }

  const canAccept = ["submitted", "received", "reviewing"].includes(status);
  const canPrepare = ["confirmed", "accepted"].includes(status);
  const canReady = ["preparing", "confirmed", "accepted"].includes(status);
  const canCollect = status === "ready";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/orders/${orderId}`}
        className="rounded-sm border border-[#E7DECE] px-3 py-1.5 text-xs font-medium text-[#151411] hover:border-[#C6A15B]"
      >
        Ouvrir
      </Link>
      {canAccept && (
        <ActionButton disabled={pending} onClick={() => setStatus("confirmed")}>
          Accepter
        </ActionButton>
      )}
      {canPrepare && (
        <ActionButton disabled={pending} onClick={() => setStatus("preparing")}>
          Préparer
        </ActionButton>
      )}
      {canReady && (
        <ActionButton disabled={pending} onClick={() => setStatus("ready")}>
          Prête
        </ActionButton>
      )}
      {canCollect && (
        <ActionButton disabled={pending} onClick={() => setStatus("completed")}>
          Récupérée
        </ActionButton>
      )}
      <Link
        href={`/admin/orders/${orderId}`}
        className="rounded-sm px-3 py-1.5 text-xs text-[#71695F] hover:text-[#692031]"
      >
        Estimation
      </Link>
      {error && <span className="text-xs text-[#9B3444]">{error}</span>}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="min-h-[32px] rounded-sm bg-[#692031] px-3 py-1.5 text-xs font-medium text-[#F7F0E4] hover:bg-[#551525] disabled:opacity-50"
    >
      {children}
    </button>
  );
}
