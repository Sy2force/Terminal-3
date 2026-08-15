"use client";

import { useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Veuillez entrer une adresse email valide.");
      return;
    }

    // Simulate API call
    setStatus("success");
    setMessage("Merci pour votre inscription !");
    setEmail("");
    
    setTimeout(() => {
      setStatus("idle");
      setMessage("");
    }, 3000);
  };

  return (
    <section className="py-24 bg-creme">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gris-chaud mb-2">Le carnet Terminal 3</p>
          <h2 className="font-serif text-4xl text-noir-profond mb-4">
            Nos arrivages, nos conseils et quelques belles surprises.
          </h2>
          <p className="text-texte-clair/70 mb-8">
            Rejoignez notre communauté pour recevoir nos dernières nouveautés et offres exclusives.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email"
                className="flex-1 px-6 py-[46px] bg-white border border-or-principal/20 rounded-sm text-noir-profond placeholder:text-gris-chaud focus:outline-none focus:border-or-principal"
                disabled={status !== "idle"}
              />
              <button
                type="submit"
                disabled={status !== "idle"}
                className="inline-flex items-center justify-center gap-2 px-8 py-[46px] bg-bordeaux-principal text-texte-clair font-medium tracking-wide transition-all hover:bg-bordeaux-clair disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "idle" ? (
                  <>
                    S&apos;inscrire
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : status === "success" ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <X className="h-5 w-5" />
                )}
              </button>
            </div>

            {message && (
              <div className={`mt-4 text-sm ${
                status === "success" ? "text-green-700" : "text-red-700"
              }`}>
                {message}
              </div>
            )}
          </form>

          <p className="mt-6 text-xs text-gris-chaud">
            En vous inscrivant, vous acceptez notre politique de confidentialité.
          </p>
        </div>
      </div>
    </section>
  );
}