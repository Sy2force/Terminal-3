import { MapPin, Phone, Mail, Clock } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import type { OpeningHoursEntry } from "@/lib/config";
import type { PageContentRow } from "@/types/database";
import { PageContentRenderer } from "@/components/public/page-content-renderer";
import { ContactForm } from "@/components/contact/contact-form";

const DAY_LABELS: Record<OpeningHoursEntry["day"], string> = {
  sunday: "Dimanche",
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
};

interface ContactPageProps {
  settings: SiteSettings;
  pageContent?: PageContentRow | null;
}

export function ContactPageContent({ settings, pageContent }: ContactPageProps) {
  const hasHours = settings.OPENING_HOURS.some((h) => h.open && h.close);
  const blocks = pageContent?.blocks;

  return (
    <div className="min-h-screen bg-noir-profond">
      {/* Cover section */}
      <div className="relative h-96 bg-gradient-to-br from-bordeaux-principal via-brun-cave to-noir-profond">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-texte-clair mb-4">
              {pageContent?.title ?? "Contact"}
            </h1>
            <p className="text-lg text-texte-clair/70 max-w-2xl mx-auto">
              {pageContent?.subtitle ?? "Nous sommes à votre écoute pour toute question ou suggestion."}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact information */}
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-3xl text-texte-clair mb-6">Nos coordonnées</h2>
              <div className="space-y-6">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-or-principal/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-or-principal" />
                  </div>
                  <div>
                    <h3 className="text-sm uppercase tracking-wider text-or-principal mb-2">Adresse</h3>
                    <p className="text-texte-clair/70">{settings.STORE_ADDRESS}</p>
                  </div>
                </div>

                {/* Phone */}
                {settings.STORE_PHONE && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-or-principal/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-or-principal" />
                    </div>
                    <div>
                      <h3 className="text-sm uppercase tracking-wider text-or-principal mb-2">Téléphone</h3>
                      <a href={`tel:${settings.STORE_PHONE}`} className="text-texte-clair/70 hover:text-or-principal transition-colors">
                        {settings.STORE_PHONE}
                      </a>
                    </div>
                  </div>
                )}

                {/* WhatsApp */}
                {settings.STORE_WHATSAPP && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-or-principal/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-or-principal" />
                    </div>
                    <div>
                      <h3 className="text-sm uppercase tracking-wider text-or-principal mb-2">WhatsApp</h3>
                      <a 
                        href={`https://wa.me/${settings.STORE_WHATSAPP.replace(/\D/g, '')}`} 
                        className="text-texte-clair/70 hover:text-or-principal transition-colors"
                      >
                        {settings.STORE_WHATSAPP}
                      </a>
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-or-principal/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-or-principal" />
                  </div>
                  <div>
                    <h3 className="text-sm uppercase tracking-wider text-or-principal mb-2">Email</h3>
                    <a href="mailto:contact@terminal3.co.il" className="text-texte-clair/70 hover:text-or-principal transition-colors">
                      contact@terminal3.co.il
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Opening hours */}
            {hasHours && (
              <div>
                <h2 className="font-serif text-3xl text-texte-clair mb-6">Horaires d&rsquo;ouverture</h2>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-or-principal/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-or-principal" />
                  </div>
                  <div className="flex-1">
                    <ul className="space-y-2">
                      {settings.OPENING_HOURS.map((entry) => (
                        <li key={entry.day} className="flex justify-between gap-4 text-texte-clair/70">
                          <span>{DAY_LABELS[entry.day]}</span>
                          <span>
                            {entry.open && entry.close
                              ? `${entry.open}–${entry.close}`
                              : "Fermé"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact form */}
          <div>
            <h2 className="font-serif text-3xl text-texte-clair mb-6">Envoyez-nous un message</h2>
            <ContactForm />
          </div>
        </div>

        {Array.isArray(blocks) && blocks.length > 0 && (
          <div className="mt-12">
            <PageContentRenderer blocks={blocks} />
          </div>
        )}
      </div>
    </div>
  );
}