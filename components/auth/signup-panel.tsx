"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { createCustomerAccount, createBarAccount } from "@/app/inscription/actions";

type AccountType = "personal" | "business";

function inputClass() {
  return "rounded-sm border border-white/10 bg-graphite px-4 py-3 text-ivory outline-none focus:border-champagne";
}

function labelClass() {
  return "flex flex-col gap-2 text-sm text-ivory/80";
}

export function SignupPanel({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [type, setType] = useState<AccountType>("personal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [personal, setPersonal] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    ageConfirmed: false,
    termsAccepted: false,
    privacyAccepted: false,
  });

  const [business, setBusiness] = useState({
    businessName: "",
    contactFirstName: "",
    contactLastName: "",
    contactEmail: "",
    contactPhone: "",
    whatsapp: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
    password: "",
    confirmPassword: "",
    ageConfirmed: false,
    termsAccepted: false,
    privacyAccepted: false,
  });

  async function handlePersonalSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (personal.password !== personal.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const result = await createCustomerAccount({
      accountType: "personal",
      firstName: personal.firstName,
      lastName: personal.lastName,
      email: personal.email,
      phone: personal.phone,
      password: personal.password,
      ageConfirmed: personal.ageConfirmed,
      termsAccepted: personal.termsAccepted,
      privacyAccepted: personal.privacyAccepted,
    });

    if (!result.success) {
      setLoading(false);
      setError(result.error ?? "Impossible de créer le compte.");
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: personal.email,
      password: personal.password,
    });

    setLoading(false);

    if (signInError) {
      setError("Compte créé. Veuillez vous connecter pour continuer.");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function handleBusinessSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (business.password !== business.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    const result = await createBarAccount({
      accountType: "business",
      businessName: business.businessName,
      contactFirstName: business.contactFirstName,
      contactLastName: business.contactLastName,
      contactEmail: business.contactEmail,
      contactPhone: business.contactPhone,
      whatsapp: business.whatsapp,
      address: business.address,
      city: business.city,
      postalCode: business.postalCode,
      notes: business.notes,
      password: business.password,
      ageConfirmed: business.ageConfirmed,
      termsAccepted: business.termsAccepted,
      privacyAccepted: business.privacyAccepted,
    });

    if (!result.success) {
      setLoading(false);
      setError(result.error ?? "Impossible de créer le compte.");
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: business.contactEmail,
      password: business.password,
    });

    setLoading(false);

    if (signInError) {
      setError("Compte créé. Veuillez vous connecter pour continuer.");
      return;
    }

    router.push("/compte");
    router.refresh();
  }

  const checkboxClass =
    "mt-0.5 h-4 w-4 rounded border-white/10 bg-graphite text-champagne focus:ring-champagne";

  return (
    <div>
      <span className="text-xs uppercase tracking-[0.3em] text-champagne">Nouveau client</span>
      <h1 className="mt-2 font-serif text-3xl text-ivory">Créer mon compte</h1>

      <div className="mt-6 flex rounded-full border border-white/10 bg-graphite p-1">
        <button
          type="button"
          onClick={() => setType("personal")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            type === "personal" ? "bg-champagne text-obsidian" : "text-ivory/70 hover:text-ivory"
          }`}
        >
          Particulier
        </button>
        <button
          type="button"
          onClick={() => setType("business")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            type === "business" ? "bg-champagne text-obsidian" : "text-ivory/70 hover:text-ivory"
          }`}
        >
          Bar / Professionnel
        </button>
      </div>

      {type === "personal" ? (
        <form onSubmit={handlePersonalSubmit} className="mt-8 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass()}>
              Prénom
              <input
                required
                value={personal.firstName}
                onChange={(e) => setPersonal({ ...personal, firstName: e.target.value })}
                className={inputClass()}
              />
            </label>
            <label className={labelClass()}>
              Nom
              <input
                required
                value={personal.lastName}
                onChange={(e) => setPersonal({ ...personal, lastName: e.target.value })}
                className={inputClass()}
              />
            </label>
          </div>
          <label className={labelClass()}>
            Email
            <input
              required
              type="email"
              value={personal.email}
              onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
              className={inputClass()}
              placeholder="vous@exemple.com"
            />
          </label>
          <label className={labelClass()}>
            Téléphone (Israël)
            <input
              type="tel"
              value={personal.phone}
              onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
              className={inputClass()}
              placeholder="05X-XXXXXXX"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass()}>
              Mot de passe
              <input
                required
                type="password"
                minLength={8}
                value={personal.password}
                onChange={(e) => setPersonal({ ...personal, password: e.target.value })}
                className={inputClass()}
              />
            </label>
            <label className={labelClass()}>
              Confirmer le mot de passe
              <input
                required
                type="password"
                minLength={8}
                value={personal.confirmPassword}
                onChange={(e) => setPersonal({ ...personal, confirmPassword: e.target.value })}
                className={inputClass()}
              />
            </label>
          </div>

          <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-4">
            <label className="flex items-start gap-3 text-sm text-ivory/80">
              <input
                type="checkbox"
                checked={personal.ageConfirmed}
                onChange={(e) => setPersonal({ ...personal, ageConfirmed: e.target.checked })}
                className={checkboxClass}
                required
              />
              Je confirme avoir 18 ans ou plus.
            </label>
            <label className="flex items-start gap-3 text-sm text-ivory/80">
              <input
                type="checkbox"
                checked={personal.termsAccepted}
                onChange={(e) => setPersonal({ ...personal, termsAccepted: e.target.checked })}
                className={checkboxClass}
                required
              />
              J&rsquo;accepte les{" "}
              <a href="/conditions" className="text-champagne hover:underline">
                conditions générales
              </a>
              .
            </label>
            <label className="flex items-start gap-3 text-sm text-ivory/80">
              <input
                type="checkbox"
                checked={personal.privacyAccepted}
                onChange={(e) => setPersonal({ ...personal, privacyAccepted: e.target.checked })}
                className={checkboxClass}
                required
              />
              J&rsquo;accepte la{" "}
              <a href="/confidentialite" className="text-champagne hover:underline">
                politique de confidentialité
              </a>
              .
            </label>
          </div>

          {error && <p className="text-sm text-amber-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-champagne px-6 py-3 text-sm font-semibold tracking-wide text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50"
          >
            {loading ? "Création..." : "Créer mon compte"}
          </button>

          <p className="text-center text-sm text-ivory/60">
            Déjà inscrit ?{" "}
            <Link href="/connexion" className="text-champagne hover:underline">
              Se connecter
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleBusinessSubmit} className="mt-8 flex flex-col gap-4">
          <label className={labelClass()}>
            Nom de l&apos;établissement
            <input
              required
              value={business.businessName}
              onChange={(e) => setBusiness({ ...business, businessName: e.target.value })}
              className={inputClass()}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass()}>
              Prénom du responsable
              <input
                required
                value={business.contactFirstName}
                onChange={(e) => setBusiness({ ...business, contactFirstName: e.target.value })}
                className={inputClass()}
              />
            </label>
            <label className={labelClass()}>
              Nom du responsable
              <input
                required
                value={business.contactLastName}
                onChange={(e) => setBusiness({ ...business, contactLastName: e.target.value })}
                className={inputClass()}
              />
            </label>
          </div>
          <label className={labelClass()}>
            Email professionnel
            <input
              required
              type="email"
              value={business.contactEmail}
              onChange={(e) => setBusiness({ ...business, contactEmail: e.target.value })}
              className={inputClass()}
            />
          </label>
          <label className={labelClass()}>
            Téléphone (Israël)
            <input
              required
              type="tel"
              value={business.contactPhone}
              onChange={(e) => setBusiness({ ...business, contactPhone: e.target.value })}
              className={inputClass()}
              placeholder="05X-XXXXXXX"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass()}>
              Ville
              <input
                value={business.city}
                onChange={(e) => setBusiness({ ...business, city: e.target.value })}
                className={inputClass()}
              />
            </label>
            <label className={labelClass()}>
              Code postal
              <input
                value={business.postalCode}
                onChange={(e) => setBusiness({ ...business, postalCode: e.target.value })}
                className={inputClass()}
              />
            </label>
          </div>
          <label className={labelClass()}>
            Adresse
            <input
              value={business.address}
              onChange={(e) => setBusiness({ ...business, address: e.target.value })}
              className={inputClass()}
            />
          </label>
          <label className={labelClass()}>
            Besoins / message (facultatif)
            <textarea
              rows={3}
              value={business.notes}
              onChange={(e) => setBusiness({ ...business, notes: e.target.value })}
              className={inputClass()}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass()}>
              Mot de passe
              <input
                required
                type="password"
                minLength={8}
                value={business.password}
                onChange={(e) => setBusiness({ ...business, password: e.target.value })}
                className={inputClass()}
              />
            </label>
            <label className={labelClass()}>
              Confirmer le mot de passe
              <input
                required
                type="password"
                minLength={8}
                value={business.confirmPassword}
                onChange={(e) => setBusiness({ ...business, confirmPassword: e.target.value })}
                className={inputClass()}
              />
            </label>
          </div>

          <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-4">
            <label className="flex items-start gap-3 text-sm text-ivory/80">
              <input
                type="checkbox"
                checked={business.ageConfirmed}
                onChange={(e) => setBusiness({ ...business, ageConfirmed: e.target.checked })}
                className={checkboxClass}
                required
              />
              Je confirme avoir 18 ans ou plus.
            </label>
            <label className="flex items-start gap-3 text-sm text-ivory/80">
              <input
                type="checkbox"
                checked={business.termsAccepted}
                onChange={(e) => setBusiness({ ...business, termsAccepted: e.target.checked })}
                className={checkboxClass}
                required
              />
              J&rsquo;accepte les{" "}
              <a href="/conditions" className="text-champagne hover:underline">
                conditions générales
              </a>
              .
            </label>
            <label className="flex items-start gap-3 text-sm text-ivory/80">
              <input
                type="checkbox"
                checked={business.privacyAccepted}
                onChange={(e) => setBusiness({ ...business, privacyAccepted: e.target.checked })}
                className={checkboxClass}
                required
              />
              J&rsquo;accepte la{" "}
              <a href="/confidentialite" className="text-champagne hover:underline">
                politique de confidentialité
              </a>
              .
            </label>
          </div>

          {error && <p className="text-sm text-amber-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-champagne px-6 py-3 text-sm font-semibold tracking-wide text-obsidian transition-colors hover:bg-soft-gold disabled:opacity-50"
          >
            {loading ? "Création..." : "Créer ma fiche pro"}
          </button>

          <p className="text-center text-sm text-ivory/60">
            Déjà inscrit ?{" "}
            <Link href="/connexion" className="text-champagne hover:underline">
              Se connecter
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
