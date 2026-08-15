"use client";

import { useState, useTransition } from "react";
import { Search, Eye, CheckCircle2, XCircle, RotateCcw, History } from "lucide-react";
import {
  listVerificationRequests,
  getIdentityDocSignedUrl,
  approveVerification,
  rejectVerification,
  requestNewDocument,
  listVerificationHistory,
  type PendingVerificationRow,
  type VerificationAuditRow,
} from "@/app/admin/verifications/actions";

const STATUS_LABELS: Record<string, string> = {
  pending_verification: "En attente",
  rejected: "Refusé",
  suspended: "Suspendu",
};

export function VerificationRequestsList({
  initialRequests,
}: {
  initialRequests: PendingVerificationRow[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [history, setHistory] = useState<VerificationAuditRow[] | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function refresh(nextSearch = search) {
    startTransition(async () => {
      const results = await listVerificationRequests(nextSearch || undefined);
      setRequests(results);
    });
  }

  async function handleViewDoc(documentId: string | null) {
    setActionError(null);
    if (!documentId) {
      setActionError("Aucun document disponible pour ce compte.");
      return;
    }
    const url = await getIdentityDocSignedUrl(documentId);
    if (!url) {
      setActionError("Impossible de générer le lien sécurisé du document.");
      return;
    }
    setDocUrl(url);
  }

  async function handleApprove(userId: string) {
    setActionError(null);
    const result = await approveVerification(userId);
    if (!result.success) {
      setActionError(result.error ?? "Erreur.");
      return;
    }
    refresh();
  }

  async function handleReject() {
    if (!rejectingUserId) return;
    setActionError(null);
    const result = await rejectVerification(rejectingUserId, rejectReason);
    if (!result.success) {
      setActionError(result.error ?? "Erreur.");
      return;
    }
    setRejectingUserId(null);
    setRejectReason("");
    refresh();
  }

  async function handleRequestNewDoc(userId: string) {
    setActionError(null);
    const result = await requestNewDocument(userId);
    if (!result.success) {
      setActionError(result.error ?? "Erreur.");
      return;
    }
    refresh();
  }

  async function handleShowHistory(userId: string) {
    const rows = await listVerificationHistory(userId);
    setHistory(rows);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-sm border border-white/10 bg-graphite px-4 py-2.5">
        <Search className="h-4 w-4 text-muted-grey" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && refresh()}
          placeholder="Rechercher par nom, téléphone ou email"
          className="w-full bg-transparent text-sm text-ivory outline-none placeholder:text-muted-grey"
        />
        <button
          type="button"
          onClick={() => refresh()}
          className="text-xs uppercase tracking-wide text-champagne hover:text-soft-gold"
        >
          Rechercher
        </button>
      </div>

      {actionError && (
        <p className="rounded-sm border border-red-400/30 bg-red-400/10 px-4 py-2 text-sm text-red-400">
          {actionError}
        </p>
      )}

      {requests.length === 0 && (
        <div className="rounded-sm border border-white/5 bg-graphite p-12 text-center text-sm text-muted-grey">
          Aucune demande à traiter.
        </div>
      )}

      <div className="grid gap-4">
        {requests.map((r) => (
          <div
            key={r.userId}
            className="flex flex-col gap-4 rounded-sm border border-white/5 bg-graphite/30 p-5 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-ivory">
                  {r.firstName || r.lastName ? `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim() : "Client"}
                </span>
                <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                  {STATUS_LABELS[r.status] ?? r.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-ivory/70">
                {r.email && <span>{r.email}</span>}
                {r.phone && <span>{r.phone}</span>}
              </div>
              <p className="text-xs text-muted-grey">
                Inscrit le {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                {r.documentCreatedAt &&
                  ` · Document envoyé le ${new Date(r.documentCreatedAt).toLocaleDateString("fr-FR")}`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleViewDoc(r.documentId)}
                className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-xs text-ivory/80 hover:border-champagne/40"
              >
                <Eye className="h-3.5 w-3.5" /> Voir le document
              </button>
              <button
                type="button"
                onClick={() => handleApprove(r.userId)}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-full bg-champagne px-3 py-2 text-xs font-semibold text-obsidian hover:bg-soft-gold disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Valider
              </button>
              <button
                type="button"
                onClick={() => setRejectingUserId(r.userId)}
                className="flex items-center gap-1.5 rounded-full border border-red-400/40 px-3 py-2 text-xs text-red-400 hover:bg-red-400/10"
              >
                <XCircle className="h-3.5 w-3.5" /> Refuser
              </button>
              <button
                type="button"
                onClick={() => handleRequestNewDoc(r.userId)}
                className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-xs text-ivory/80 hover:border-champagne/40"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Nouveau document
              </button>
              <button
                type="button"
                onClick={() => handleShowHistory(r.userId)}
                className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-xs text-ivory/80 hover:border-champagne/40"
              >
                <History className="h-3.5 w-3.5" /> Historique
              </button>
            </div>
          </div>
        ))}
      </div>

      {docUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setDocUrl(null)}
        >
          <div className="max-h-[85vh] max-w-3xl overflow-auto rounded-sm bg-graphite p-4" onClick={(e) => e.stopPropagation()}>
            {/* Signed URL is short-lived and dynamically generated — not a static domain next/image can be configured for. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={docUrl} alt="Justificatif d'identité" className="max-h-[75vh] w-auto rounded-sm" />
            <p className="mt-3 text-center text-xs text-muted-grey">
              Lien temporaire — expire dans quelques minutes.
            </p>
          </div>
        </div>
      )}

      {rejectingUserId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setRejectingUserId(null)}
        >
          <div
            className="w-full max-w-md rounded-sm bg-graphite p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-lg text-ivory">Motif du refus</h3>
            <textarea
              autoFocus
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ex : document illisible, photo recadrée, information manquante..."
              className="mt-3 w-full rounded-sm border border-white/10 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-champagne"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingUserId(null)}
                className="rounded-full border border-white/10 px-4 py-2 text-xs text-ivory/80"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleReject}
                className="rounded-full bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600"
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}

      {history && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setHistory(null)}
        >
          <div className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-sm bg-graphite p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-lg text-ivory">Historique des décisions</h3>
            {history.length === 0 ? (
              <p className="mt-3 text-sm text-muted-grey">Aucune décision enregistrée.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {history.map((h) => (
                  <li key={h.id} className="rounded-sm border border-white/5 bg-obsidian p-3 text-sm">
                    <p className="text-ivory">{h.action}</p>
                    {h.reason && <p className="mt-1 text-red-400/90">{h.reason}</p>}
                    <p className="mt-1 text-xs text-muted-grey">
                      {h.actorEmail ?? "Admin"} · {new Date(h.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
