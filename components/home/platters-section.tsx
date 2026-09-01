import Image from "next/image";
import type { SiteSettings } from "@/lib/settings";

interface PlattersSectionProps {
  settings: SiteSettings;
}

export function PlattersSection({ settings }: PlattersSectionProps) {
  const platters = [
    {
      id: "saumon",
      name: "Plateau de saumon fumé",
      description: "Saumon fumé artisanal, câpres, oignons rouges, pain de seigle",
      people: "4-6 personnes",
      price: "à partir de 189 ₪",
      preparation: "Préparation : 24h",
      image: "/images/salmon-plateaux/plateau-01.webp",
      whatsapp: settings.STORE_WHATSAPP,
    },
    {
      id: "charcuterie",
      name: "Plateau de charcuterie",
      description: "Sélection de charcuteries fines, cornichons, pain de campagne",
      people: "4-6 personnes",
      price: "à partir de 159 ₪",
      preparation: "Préparation : 24h",
      image: "/images/terminal-3/platters/charcuterie/platter-charcuterie-01.webp",
      whatsapp: settings.STORE_WHATSAPP,
    },
  ];

  return (
    <section className="py-24 bg-fond-papier">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-gris-chaud mb-2">Sur commande</p>
          <h2 className="font-serif text-4xl text-noir-profond">Plateaux sur commande</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {platters.map((platter) => (
            <div
              key={platter.id}
              className="group relative overflow-hidden rounded-sm border border-or-principal/20 bg-noir-profond transition-all duration-300 hover:border-or-principal/50 hover:shadow-xl hover:shadow-or-principal/10"
            >
              <div className="relative h-64 bg-gradient-to-b from-brun-cave to-noir-profond">
                <Image
                  src={platter.image}
                  alt={platter.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir-profond via-transparent to-transparent" />
              </div>

              <div className="p-8 space-y-4">
                <h3 className="font-serif text-2xl text-texte-clair">{platter.name}</h3>
                <p className="text-texte-clair/70">{platter.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-texte-clair/60">
                  <div>
                    <span className="block text-or-principal font-medium">{platter.people}</span>
                    <span className="text-xs">Personnes</span>
                  </div>
                  <div>
                    <span className="block text-or-principal font-medium">{platter.price}</span>
                    <span className="text-xs">Prix</span>
                  </div>
                </div>

                <p className="text-xs text-texte-clair/50">{platter.preparation}</p>

                {platter.whatsapp && (
                  <a
                    href={`https://wa.me/${platter.whatsapp.replace(/\D/g, '')}?text=Bonjour, je souhaite commander le ${encodeURIComponent(platter.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full px-8 py-[46px] bg-or-principal text-noir-profond font-medium tracking-wide transition-all hover:bg-or-clair hover:shadow-lg hover:shadow-or-principal/20"
                  >
                    Commander sur WhatsApp
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}