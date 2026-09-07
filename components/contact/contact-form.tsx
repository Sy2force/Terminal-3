"use client";

import { useActionState, useEffect } from "react";
import { sendContactMessage } from "@/app/contact/actions";
import { Loader2, Send } from "lucide-react";

export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessage, {
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      const form = document.getElementById("contact-form") as HTMLFormElement | null;
      form?.reset();
    }
  }, [state]);

  return (
    <form id="contact-form" action={formAction} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm uppercase tracking-wider text-or-principal mb-2">
          Nom
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          minLength={1}
          maxLength={200}
          className="w-full px-4 py-3 bg-noir-chaud border border-or-principal/20 rounded-sm text-texte-clair placeholder:text-texte-clair/40 focus:outline-none focus:border-or-principal"
          placeholder="Votre nom"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm uppercase tracking-wider text-or-principal mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          maxLength={200}
          className="w-full px-4 py-3 bg-noir-chaud border border-or-principal/20 rounded-sm text-texte-clair placeholder:text-texte-clair/40 focus:outline-none focus:border-or-principal"
          placeholder="votre@email.com"
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm uppercase tracking-wider text-or-principal mb-2">
          Sujet
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          required
          minLength={1}
          maxLength={200}
          className="w-full px-4 py-3 bg-noir-chaud border border-or-principal/20 rounded-sm text-texte-clair placeholder:text-texte-clair/40 focus:outline-none focus:border-or-principal"
          placeholder="Sujet de votre message"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm uppercase tracking-wider text-or-principal mb-2">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          minLength={1}
          maxLength={5000}
          className="w-full px-4 py-3 bg-noir-chaud border border-or-principal/20 rounded-sm text-texte-clair placeholder:text-texte-clair/40 focus:outline-none focus:border-or-principal resize-none"
          placeholder="Votre message..."
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-400" role="alert">
          {state.error}
        </p>
      )}
      {state.success && state.message && (
        <p className="text-sm text-green-400" role="status">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-or-principal text-noir-profond font-medium tracking-wide transition-all hover:bg-or-clair hover:shadow-lg hover:shadow-or-principal/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Envoyer le message
          </>
        )}
      </button>
    </form>
  );
}
