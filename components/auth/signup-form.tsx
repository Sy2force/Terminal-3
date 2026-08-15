"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { completeRegistration } from "@/app/inscription/actions";
import { IdentityDocUpload } from "@/components/auth/identity-doc-upload";

const STEPS = ["Compte", "Coordonnées", "Justificatif"] as const;

function inputClass() {
  return "rounded-sm border border-white/10 bg-graphite px-4 py-3 text-ivory outline-none focus:border-champagne";
}

function SignupFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account/verification";

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [docUploaded, setDocUploaded] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    phone: "",
    city: "",
    street: "",
    buildingNumber: "",
    apartment: "",
    postalCode: "",
    deliveryInstructions: "",
    termsAccepted: false,
    ageConfirmed: false,
    privacyAccepted: false,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { first_name: form.firstName, last_name: form.lastName } },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message === "User already registered"
        ? "Un compte existe déjà avec cet email."
        : "Impossible de créer le compte. Vérifiez vos informations.");
      return;
    }

    if (!data.session || !data.user) {
      setError(
        "Compte créé. Vérifiez votre email pour confirmer votre adresse, puis connectez-vous pour continuer votre inscription.",
      );
      return;
    }

    setUserId(data.user.id);
    setStep(1);
  }

  async function handleSubmitDetails(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.ageConfirmed) {
      setError("Vous devez confirmer avoir 18 ans ou plus.");
      return;
    }
    if (!form.termsAccepted) {
      setError("Vous devez accepter les conditions générales.");
      return;
    }
    if (!form.privacyAccepted) {
      setError("Vous devez accepter la politique de confidentialité.");
      return;
    }

    setLoading(true);
    const result = await completeRegistration({
      firstName: form.firstName,
      lastName: form.lastName,
      dateOfBirth: form.dateOfBirth,
      phone: form.phone,
      city: form.city,
      street: form.street,
      buildingNumber: form.buildingNumber,
      apartment: form.apartment || undefined,
      postalCode: form.postalCode || undefined,
      deliveryInstructions: form.deliveryInstructions || undefined,
      termsAccepted: form.termsAccepted,
      ageConfirmed: form.ageConfirmed,
      privacyAccepted: form.privacyAccepted,
    });
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Une erreur est survenue.");
      return;
    }
    setStep(2);
  }

  function finish() {
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-6 py-16">
      <span className="text-xs uppercase tracking-[0.3em] text-champagne">Nouveau client</span>
      <h1 className="mt-2 font-serif text-3xl text-ivory">Créer mon compte</h1>

      {/* Step progress */}
      <div className="mt-6 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                i <= step ? "bg-champagne text-obsidian" : "bg-white/10 text-muted-grey"
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-xs ${i <= step ? "text-ivory" : "text-muted-grey"}`}>{label}</span>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-white/10" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <form onSubmit={handleCreateAccount} className="mt-8 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-ivory/80">
              Prénom
              <input required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className={inputClass()} />
            </label>
            <label className="flex flex-col gap-2 text-sm text-ivory/80">
              Nom
              <input required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className={inputClass()} />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm text-ivory/80">
            Email
            <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputClass()} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-ivory/80">
              Mot de passe
              <input required type="password" minLength={8} value={form.password} onChange={(e) => set("password", e.target.value)} className={inputClass()} />
            </label>
            <label className="flex flex-col gap-2 text-sm text-ivory/80">
              Confirmer le mot de passe
              <input required type="password" minLength={8} value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} className={inputClass()} />
            </label>
          </div>
          {error && <p className="text-sm text-amber-400">{error}</p>}
          <button type="submit" disabled={loading} className="mt-2 rounded-full bg-champagne px-6 py-3 text-sm font-semibold tracking-wide text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50">
            {loading ? "Création..." : "Continuer"}
          </button>
          <p className="text-center text-xs text-muted-grey">
            Vous avez déjà un compte ?{" "}
            <a href="/login" className="text-champagne hover:underline">Se connecter</a>
          </p>
        </form>
      )}

      {step === 1 && (
        <form onSubmit={handleSubmitDetails} className="mt-8 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-ivory/80">
              Date de naissance
              <input required type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} className={inputClass()} />
            </label>
            <label className="flex flex-col gap-2 text-sm text-ivory/80">
              Téléphone (Israël)
              <input required type="tel" placeholder="05X-XXXXXXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass()} />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-ivory/80">
              Ville
              <input required value={form.city} onChange={(e) => set("city", e.target.value)} className={inputClass()} />
            </label>
            <label className="flex flex-col gap-2 text-sm text-ivory/80">
              Rue
              <input required value={form.street} onChange={(e) => set("street", e.target.value)} className={inputClass()} />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm text-ivory/80">
              Numéro
              <input required value={form.buildingNumber} onChange={(e) => set("buildingNumber", e.target.value)} className={inputClass()} />
            </label>
            <label className="flex flex-col gap-2 text-sm text-ivory/80">
              Étage / appt.
              <input value={form.apartment} onChange={(e) => set("apartment", e.target.value)} className={inputClass()} />
            </label>
            <label className="flex flex-col gap-2 text-sm text-ivory/80">
              Code postal
              <input value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} className={inputClass()} />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm text-ivory/80">
            Instructions de livraison (facultatif)
            <textarea rows={2} value={form.deliveryInstructions} onChange={(e) => set("deliveryInstructions", e.target.value)} className={inputClass()} />
          </label>

          <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-4">
            <label className="flex items-start gap-3 text-sm text-ivory/80">
              <input type="checkbox" checked={form.ageConfirmed} onChange={(e) => set("ageConfirmed", e.target.checked)} className="mt-0.5 h-4 w-4" />
              Je confirme avoir 18 ans ou plus.
            </label>
            <label className="flex items-start gap-3 text-sm text-ivory/80">
              <input type="checkbox" checked={form.termsAccepted} onChange={(e) => set("termsAccepted", e.target.checked)} className="mt-0.5 h-4 w-4" />
              J&rsquo;accepte les <a href="/conditions" className="text-champagne hover:underline">conditions générales</a>.
            </label>
            <label className="flex items-start gap-3 text-sm text-ivory/80">
              <input type="checkbox" checked={form.privacyAccepted} onChange={(e) => set("privacyAccepted", e.target.checked)} className="mt-0.5 h-4 w-4" />
              J&rsquo;accepte la <a href="/confidentialite" className="text-champagne hover:underline">politique de confidentialité</a>.
            </label>
          </div>

          {error && <p className="text-sm text-amber-400">{error}</p>}
          <button type="submit" disabled={loading} className="mt-2 rounded-full bg-champagne px-6 py-3 text-sm font-semibold tracking-wide text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50">
            {loading ? "Enregistrement..." : "Continuer"}
          </button>
        </form>
      )}

      {step === 2 && userId && (
        <div className="mt-8 flex flex-col gap-4">
          <p className="text-sm text-ivory/70">
            Pour valider votre compte et vous permettre de commander des produits soumis à une
            limite d&rsquo;âge, nous devons vérifier votre identité. Cette photo n&rsquo;est jamais
            partagée et reste stockée de façon privée et sécurisée.
          </p>
          <IdentityDocUpload
            userId={userId}
            side="front"
            label="Recto de votre pièce d'identité (Teudat Zehut ou passeport)"
            onUploaded={() => setDocUploaded(true)}
          />
          <button
            type="button"
            onClick={finish}
            disabled={!docUploaded}
            className="mt-2 rounded-full bg-champagne px-6 py-3 text-sm font-semibold tracking-wide text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50"
          >
            Terminer l&rsquo;inscription
          </button>
          {!docUploaded && (
            <p className="text-center text-xs text-muted-grey">
              Le téléversement du justificatif est obligatoire pour activer votre compte.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function SignupForm() {
  return (
    <Suspense fallback={null}>
      <SignupFormInner />
    </Suspense>
  );
}
