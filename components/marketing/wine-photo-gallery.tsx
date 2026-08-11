import Image from "next/image";

const WINE_PHOTOS = [
  {
    src: "/images/vins/vin-1.jpg",
    alt: "Bouteilles de vin rouge",
    title: "Vins Rouges",
  },
  {
    src: "/images/vins/vin-2.jpg",
    alt: "Bouteilles de vin blanc",
    title: "Vins Blancs",
  },
  {
    src: "/images/vins/vin-3.jpg",
    alt: "Vins israéliens",
    title: "Vins d'Israël",
  },
  {
    src: "/images/vins/vin-4.jpg",
    alt: "Vins français",
    title: "Vins de France",
  },
  {
    src: "/images/vins/vin-5.jpg",
    alt: "Champagne",
    title: "Champagnes",
  },
  {
    src: "/images/vins/vin-6.jpg",
    alt: "Vins rosés",
    title: "Vins Rosés",
  },
  {
    src: "/images/vins/vin-7.jpg",
    alt: "Vins de collection",
    title: "Collection",
  },
  {
    src: "/images/vins/vin-8.jpg",
    alt: "Vins premium",
    title: "Premium",
  },
];

export function WinePhotoGallery() {
  return (
    <section className="relative py-16 bg-obsidian overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(197, 163, 90, 0.3) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-sm uppercase tracking-[0.4em] text-champagne mb-4">
            Notre Univers
          </span>
          <h2 className="font-serif text-5xl lg:text-6xl xl:text-7xl text-ivory mb-4">
            Galerie <span className="text-champagne">Vinicole</span>
          </h2>
          <p className="text-xl lg:text-2xl text-muted-grey max-w-2xl mx-auto">
            Découvrez notre sélection exceptionnelle de vins à travers notre galerie visuelle.
          </p>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {WINE_PHOTOS.map((photo, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-graphite"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-serif text-lg text-ivory group-hover:text-champagne transition-colors">
                  {photo.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Large Featured Photo */}
        <div className="mt-8 relative aspect-[21/9] overflow-hidden rounded-2xl border border-white/10">
          <Image
            src="/images/vins/vin-1.jpg"
            alt="Cave à vin Terminal 3 - Vue panoramique"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
            <span className="inline-block text-sm uppercase tracking-[0.3em] text-champagne mb-3">
              Signature
            </span>
            <h3 className="font-serif text-3xl lg:text-4xl text-ivory mb-2">
              Terminal 3 Wine Cellar
            </h3>
            <p className="text-lg text-muted-grey max-w-2xl">
              Une expérience unique au cœur de Jérusalem, avec plus de 500 références de vins premium.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
