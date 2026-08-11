"use client";

import { useState } from "react";
import { verifyAgeAction } from "@/app/admin/orders/actions";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface AgeVerificationActionProps {
  verificationId: string;
  currentStatus: string;
  orderId: string;
}

export function AgeVerificationAction({
  verificationId,
  currentStatus,
  orderId,
}: AgeVerificationActionProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (newStatus: "VERIFIED" | "FAILED") => {
    setLoading(true);
    const result = await verifyAgeAction(verificationId, newStatus);
    if (result.success) {
      setStatus(newStatus);
    }
    setLoading(false);
  };

  if (status === "VERIFIED") {
    return (
      <div className="flex items-center gap-2 text-green-400 text-sm">
        <CheckCircle className="h-4 w-4" />
        <span>Vérifié (18+)</span>
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="flex items-center gap-2 text-red-400 text-sm">
        <XCircle className="h-4 w-4" />
        <span>Échec vérification</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1 text-amber-400 text-sm">
        <AlertTriangle className="h-4 w-4" />
        En attente
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => handleVerify("VERIFIED")}
          disabled={loading}
          className="px-2 py-1 text-xs rounded border border-green-400/30 text-green-400 hover:bg-green-400/10 disabled:opacity-50"
        >
          ✓ OK
        </button>
        <button
          onClick={() => handleVerify("FAILED")}
          disabled={loading}
          className="px-2 py-1 text-xs rounded border border-red-400/30 text-red-400 hover:bg-red-400/10 disabled:opacity-50"
        >
          ✗ Refus
        </button>
      </div>
    </div>
  );
}
