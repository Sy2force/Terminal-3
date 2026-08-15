import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, XCircle, ShieldAlert } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getMyVerificationProfile, getMyIdentityDocuments } from "@/lib/data/verification";
import { ResubmitIdentityDoc } from "@/components/auth/resubmit-identity-doc";

export default async function AccountVerificationPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/account/verification");

  const [profile, documents] = await Promise.all([
    getMyVerificationProfile(),
    getMyIdentityDocuments(),
  ]);

  const status = profile?.verificationStatus ?? "pending_verification";

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 lg:px-8">
      <span className="text-xs uppercase tracking-[0.3em] text-champagne">Mon compte</span>
      <h1 className="mt-2 font-serif text-3xl text-ivory">Vérification d&rsquo;identité</h1>

      <div className="mt-8 rounded-sm border border-white/5 bg-graphite p-6">
        {status === "verified" && (
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-champagne" />
            <div>
              <p className="font-medium text-ivory">Votre compte a été validé</p>
              <p className="mt-1 text-sm text-muted-grey">
                Vous pouvez désormais passer commande librement, y compris pour les produits
                soumis à une limite d&rsquo;âge.
              </p>
              {profile?.verificationDecidedAt && (
                <p className="mt-2 text-xs text-muted-grey">
                  Validé le {new Date(profile.verificationDecidedAt).toLocaleDateString("fr-FR")}
                </p>
              )}
            </div>
          </div>
        )}

        {status === "pending_verification" && (
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-6 w-6 shrink-0 text-champagne" />
            <div>
              <p className="font-medium text-ivory">Votre compte est en cours de vérification</p>
              <p className="mt-1 text-sm text-muted-grey">
                Notre équipe examine votre justificatif d&rsquo;identité. Vous pourrez commander dès
                que votre compte sera validé — généralement sous 24h ouvrées.
              </p>
            </div>
          </div>
        )}

        {status === "rejected" && (
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-400" />
            <div className="w-full">
              <p className="font-medium text-ivory">Votre document a été refusé</p>
              {profile?.verificationReason && (
                <p className="mt-1 text-sm text-red-400/90">Motif : {profile.verificationReason}</p>
              )}
              <p className="mt-2 text-sm text-muted-grey">
                Merci d&rsquo;envoyer une nouvelle photo lisible de votre pièce d&rsquo;identité.
              </p>
              <div className="mt-4">
                <ResubmitIdentityDoc userId={user.id} />
              </div>
            </div>
          </div>
        )}

        {status === "suspended" && (
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-red-400" />
            <div>
              <p className="font-medium text-ivory">Votre compte est suspendu</p>
              <p className="mt-1 text-sm text-muted-grey">
                Contactez-nous pour plus d&rsquo;informations sur votre compte.
              </p>
            </div>
          </div>
        )}
      </div>

      {documents.length > 0 && (
        <div className="mt-6 rounded-sm border border-white/5 bg-graphite p-6">
          <h2 className="font-serif text-lg text-ivory">Documents envoyés</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-ivory/70">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between">
                <span>{doc.side === "front" ? "Recto" : "Verso"}</span>
                <span className="text-xs uppercase tracking-wide text-muted-grey">
                  {new Date(doc.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <Link href="/account" className="text-sm text-champagne hover:underline">
          ← Retour à mon compte
        </Link>
      </div>
    </div>
  );
}
